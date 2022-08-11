import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import uuid from 'react-native-uuid';
import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import {
    clusterApiUrl,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;


const context = {
    network:  clusterApiUrl('devnet'),
    cluster: 'devnet',
    phantom_app_url: 'https://phantom.app',
};


const phantom_session = {        
    token: '',
    keypair: nacl.box.keyPair(),
    shared_secret: new Uint8Array(0),
    wallet_pubkey: PublicKey.default,
};


const callback_map = new Map(); //holds callback functions to be called after each return from a call to a Phantom deep link

const enum DeepLinkMethod{
    connect="connect",
    disconnect="disconnect",
    signAndSendTransaction="signAndSendTransaction",
    signAllTransactions="signAllTransactions",
    signTransaction="signTransaction",
    signMessage="signMessage",
    bogus="bogus",
}

const buildUrl = (path: string, params: URLSearchParams) => `https://phantom.app/ul/v1/${path}?${params.toString()}`;

const registerDeepLinkHandler  = (handler: Function) : string => {
    unregisterOldDeepLinkHandlers(5); //unregister handlers that have been around longer than 5 minutes
    const callback_id = uuid.v4().toString(); //this will be used to identify that the callback is for this function call
    callback_map.set(callback_id, {date:new Date(), handler}); //associate id with callback func
    return callback_id;
}

const unregisterDeepLinkHandler = (id: string) : boolean => callback_map.delete(id);

const getDeepLinkHandler = (id: string) : Function => {
    const v = callback_map.get(id);
    return v?.handler;
}

const unregisterOldDeepLinkHandlers = (minutes: number=5) =>{
    let keysToDelete = Array<string>();
    const now = new Date();
    callback_map.forEach((k,v)=>{
        if(Math.abs(now - v.date) > minutes) //delete if more than a x minutes has passed
            keysToDelete.push(k)
    });

    if(keysToDelete.length > 0){
        keysToDelete.forEach(k=> unregisterDeepLinkHandler(k));
    }
};

const callDeepLinkMethod = async (method: DeepLinkMethod, payload: any, callback_handler: Function) => {
    console.log('calling ', method);
    const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(phantom_session.keypair.publicKey),
    });

    if(method === DeepLinkMethod.connect){
        params.append("cluster", context.cluster);
        params.append("app_url", context.phantom_app_url);
    } 
    
    if(payload) {
        const [nonce, encryptedPayload] = encryptPayload(payload, phantom_session.shared_secret);
        params.append("nonce", bs58.encode(nonce));
        params.append("payload", bs58.encode(encryptedPayload));
    }    
        
    const handler_id = registerDeepLinkHandler(callback_handler);
    const callbackLink = Linking.createURL(`${handler_id}/${method}`, {queryParams:{ handler_id: handler_id}});
    params.append("redirect_link", callbackLink);

    let url = buildUrl(method, params);
    const result = Linking.openURL(url);
    
    if(!result){
        unregisterDeepLinkHandler(handler_id);
        throw new Error(`Linking.openUrl failed. url=${url}`);
    }
}
 
const handleDeepLinkCallback = ({ url }: Linking.EventType) => {
    //const {hostname, path, queryParams} = Linking.parse(url);
    console.log(`got callback: ${url}`)
    const u = new URL(url);
    let pathname = u.pathname;
    const params = u.searchParams;
    const errorCode = params.get("errorCode");
    const splitted = pathname.split('/');
    const handler_id = splitted[2]; //cleaner way to do this?
    //console.log('callback_id: ', callback_id);
    //console.log('session: ', phantom_session);

    if (errorCode) {
        if(handler_id)
            unregisterDeepLinkHandler(handler_id); 
        
        throw new Error(`Phantom deeplink return error: ${errorCode}`);
    }

    if(!handler_id)
        throw new Error(`callback_id wasn't found in url: ${url}`);

    const handler = getDeepLinkHandler(handler_id);
    if(!handler) {
        console.log("map: ", callback_map);
        throw new Error(`a handler was not defined for handler_id ${handler_id}`);    
    }
    
    unregisterDeepLinkHandler(handler_id);

    if (pathname.includes(DeepLinkMethod.signTransaction)) {
        console.log('processing SignTransaction callback');
        const signTransactionData = decryptPayload(
            params.get("data")!,
            params.get("nonce")!,
            phantom_session.shared_secret
        );

        const decodedTransaction = Transaction.from(bs58.decode(signTransactionData.transaction));
        handler(decodedTransaction);
    }
    else if (pathname.includes(DeepLinkMethod.signAndSendTransaction)) {
        console.log('processing SignAndSendTransaction callback');
        const signAndSendTransactionData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          phantom_session.shared_secret
        );
  
        handler(signAndSendTransactionData);
    } 
    else if (pathname.includes(DeepLinkMethod.signAllTransactions)) {
        console.log('processing SignAllTransactions callback');
        const signAllTransactionsData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          phantom_session.shared_secret
        );
  
        const decodedTransactions = signAllTransactionsData.transactions.map((t: string) =>
          Transaction.from(bs58.decode(t))
        );
  
        handler(decodedTransactions);
    }
    else if (pathname.includes(DeepLinkMethod.signMessage)) {
        console.log('processing SignMessage callback');
        const signMessageData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          phantom_session.shared_secret
        );
  
        handler(signMessageData);
    }
    else if (pathname.includes(DeepLinkMethod.disconnect)) {
        console.log('processing Disconnect callback');
        handler();
    }
    else if (pathname.includes(DeepLinkMethod.connect)) {
        console.log('processing Connect callback');
        const sharedSecretDapp = nacl.box.before(
          bs58.decode(params.get("phantom_encryption_public_key")!),
          phantom_session.keypair.secretKey
        );
  
        const connectData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          sharedSecretDapp
        );

        phantom_session.shared_secret = sharedSecretDapp;
        phantom_session.token = connectData.session;
        phantom_session.wallet_pubkey = new PublicKey(connectData.public_key);
        
        handler();
    }
    else {
        throw new Error(`received unknown callback: ${url}`);
    }
};


const decryptPayload = (data: string, nonce: string, sharedSecret?: Uint8Array) => {
    if (!sharedSecret) throw new Error("missing shared secret");

    const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
    if (!decryptedData) {
        throw new Error("Unable to decrypt data");
    }
    return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};


const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
    if (!sharedSecret) throw new Error("missing shared secret");
  
    const nonce = nacl.randomBytes(24);
  
    const encryptedPayload = nacl.box.after(
      Buffer.from(JSON.stringify(payload)),
      nonce,
      sharedSecret
    );
  
    return [nonce, encryptedPayload];
};


/*EXPORTED STUFF*/
export const getWalletPublicKey = (): PublicKey => phantom_session.wallet_pubkey;

export const connect = async () : Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {    
        if(phantom_session.token != '') {
            resolve();
        }
        else {        
            await Linking.getInitialURL();
            Linking.addEventListener("url", handleDeepLinkCallback);
            callDeepLinkMethod(DeepLinkMethod.connect, null, resolve);     
        }
    });
}


export const signTransaction = async (transaction: Transaction, requireAllSignatures = true, verifySignatures = true) => {
    return new Promise<Transaction>(async (resolve) => {
        await connect();

        const serializedTransaction = bs58.encode(
            transaction.serialize({requireAllSignatures, verifySignatures})
        );

        const payload = {
            session: phantom_session.token,
            transaction: serializedTransaction,
        };

        callDeepLinkMethod(DeepLinkMethod.signTransaction, payload, resolve);     
    });
  }

  export const signMessage = async (message: string) => {
    return new Promise<any>(async (resolve) => {
        await connect();
        
        const payload = {
            session: phantom_session.token,
            message: bs58.encode(Buffer.from(message)),
        };

        callDeepLinkMethod(DeepLinkMethod.signMessage, payload, resolve); 
    });
  };

  export const signAndSendTransaction = async (transaction: Transaction, requireAllSignatures=true, verifySignatures=true) => {
    return new Promise<Transaction>(async (resolve) => {

        const serializedTransaction = transaction.serialize({requireAllSignatures, verifySignatures});

        const payload = {
            session: phantom_session.token,
            transaction: bs58.encode(serializedTransaction),
        };

        callDeepLinkMethod(DeepLinkMethod.signAndSendTransaction, payload, resolve);
    });
  };

export const signAllTransactions = async (transactions: Transaction[], requireAllSignatures=true, verifySignatures=true) => {
    return new Promise<Transaction[]>(async (resolve) =>{ 

        const serializedTransactions = transactions.map((t) =>
            bs58.encode(
                t.serialize({requireAllSignatures, verifySignatures})
            )
        );

        const payload = {
            session: phantom_session.token,
            transactions: serializedTransactions,
        };

        callDeepLinkMethod(DeepLinkMethod.signAllTransactions, payload, resolve);
    });
};

export const disconnect = async () => {
    return new Promise<void>(async (resolve) =>{
        const payload = {
            session: phantom_session.token,
        };

        callDeepLinkMethod(DeepLinkMethod.disconnect, payload, resolve);
    });
  };
