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
import { Platform } from "react-native";

global.Buffer = global.Buffer || Buffer;
global.PhantomCallbackMap = new Map<string,any>(); //holds callback functions to be called after each return from a call to a Phantom deep link
global.PhantomSession = {        
    token: '',
    keypair: nacl.box.keyPair(),
    shared_secret: new Uint8Array(0),
    wallet_pubkey: PublicKey.default,
};
global.PhantomIsAndroid = Platform.OS == 'android';


const context = {
    network:  clusterApiUrl('devnet'),
    cluster: 'devnet',
    phantom_app_url: 'https://phantom.app',
};


const enum DeepLinkMethod{
    connect="connect",
    disconnect="disconnect",
    signAndSendTransaction="signAndSendTransaction",
    signAllTransactions="signAllTransactions",
    signTransaction="signTransaction",
    signMessage="signMessage",
}

const buildUrl = (path: string, params: URLSearchParams) => `https://phantom.app/ul/v1/${path}?${params.toString()}`;

const registerDeepLinkHandler  = (handler: Function) : string => {
    unregisterOldDeepLinkHandlers(5); //unregister handlers that have been around longer than 5 minutes
    const callback_id = uuid.v4().toString(); //this will be used to identify that the callback is for this function call
    //console.log('registering ', callback_id);
    global.PhantomCallbackMap.set(callback_id, {date:new Date(), handler}); //associate id with callback func
    return callback_id;
}

const unregisterDeepLinkHandler = (id: string) : boolean => global.PhantomCallbackMap.delete(id);

const getDeepLinkHandler = (id: string) : Function => {
    const v = global.PhantomCallbackMap.get(id);
    return v?.handler;
}

const unregisterOldDeepLinkHandlers = (minutes: number=5) =>{
    let keysToDelete = Array<string>();
    const now = new Date();
    global.PhantomCallbackMap.forEach((k,v)=>{
        if(Math.abs(now - v.date) > minutes) //delete if more than a x minutes has passed
            keysToDelete.push(k)
    });

    if(keysToDelete.length > 0){
        keysToDelete.forEach(k=>{
            //console.log('deleting handler ', k);
            unregisterDeepLinkHandler(k)
        });
    }
};

const callDeepLinkMethod = async (method: DeepLinkMethod, payload: any, callback_handler: Function, deepLinkReturnRoute = "") => {
    console.log('calling phantom ', method);
    
    const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(global.PhantomSession.keypair.publicKey),
    });

    if(method === DeepLinkMethod.connect){
        params.append("cluster", context.cluster);
        params.append("app_url", context.phantom_app_url);
    } 
    
    if(payload) {
        const [nonce, encryptedPayload] = encryptPayload(payload, global.PhantomSession.shared_secret);
        params.append("nonce", bs58.encode(nonce));
        params.append("payload", bs58.encode(encryptedPayload));
    }        
    
    const handlerId = registerDeepLinkHandler(callback_handler);
    const callbackLink = Linking.createURL(`${deepLinkReturnRoute}`, {queryParams:{ id: handlerId, method}});
    params.append("redirect_link", callbackLink);

    let url = buildUrl(method, params);
    //console.log('calling phantom deeplink: ', url);
    const result = Linking.openURL(url);
    
    if(!result){
        //unregisterDeepLinkHandler(handler_id);
        throw new Error(`Linking.openUrl failed. url=${url}`);
    }
}
 
const handleDeepLinkCallback = ({ url }: Linking.EventType) => {
    console.log(`got callback: ${url}`)
    const u = new URL(url);
    let pathname = u.pathname;
    const params = u.searchParams;
    const errorCode = params.get("errorCode");
    const handlerId = params.get("id");
    const method = params.get("method") ?? "";
 
    if (errorCode) {
        if(handlerId)
            unregisterDeepLinkHandler(handlerId); 
        
        throw new Error(`Phantom deeplink return error: ${errorCode}`);
    }

    if(!handlerId)
        throw new Error(`callback_id wasn't found in url: ${url}`);

    const handler = getDeepLinkHandler(handlerId);
    if(!handler) {
        console.log("map: ", global.PhantomCallbackMap);
        throw new Error(`a handler was not defined for handler_id ${handlerId}`);    
    }
    
    //unregisterDeepLinkHandler(handlerId);

    if (method.includes(DeepLinkMethod.signTransaction)) {
        console.log('processing SignTransaction callback');
        const signTransactionData = decryptPayload(
            params.get("data")!,
            params.get("nonce")!,
            global.PhantomSession.shared_secret
        );

        const decodedTransaction = Transaction.from(bs58.decode(signTransactionData.transaction));
        handler(decodedTransaction);
    }
    else if (method.includes(DeepLinkMethod.signAndSendTransaction)) {
        console.log('processing SignAndSendTransaction callback');
        const signAndSendTransactionData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          global.PhantomSession.shared_secret
        );
  
        handler(signAndSendTransactionData);
    } 
    else if (method.includes(DeepLinkMethod.signAllTransactions)) {
        console.log('processing SignAllTransactions callback');
        const signAllTransactionsData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          global.PhantomSession.shared_secret
        );
  
        const decodedTransactions = signAllTransactionsData.transactions.map((t: string) =>
          Transaction.from(bs58.decode(t))
        );
  
        handler(decodedTransactions);
    }
    else if (method.includes(DeepLinkMethod.signMessage)) {
        console.log('processing SignMessage callback');
        const signMessageData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          global.PhantomSession.shared_secret
        );
  
        handler(signMessageData);
    }
    else if (method.includes(DeepLinkMethod.disconnect)) {
        console.log('processing Disconnect callback');
        handler();
    }
    else if (method.includes(DeepLinkMethod.connect)) {
        console.log('processing Connect callback');
        const sharedSecretDapp = nacl.box.before(
          bs58.decode(params.get("phantom_encryption_public_key")!),
          global.PhantomSession.keypair.secretKey
        );
  
        const connectData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          sharedSecretDapp
        );

        global.PhantomSession.shared_secret = sharedSecretDapp;
        global.PhantomSession.token = connectData.session;
        global.PhantomSession.wallet_pubkey = new PublicKey(connectData.public_key);
        
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



/** gets the last retrieved wallet public key*/
export const getWalletPublicKey = (): PublicKey => global.PhantomSession.wallet_pubkey;

/** connects to phantom wallet
 * @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const connect = async (force=false, deepLinkReturnRoute = "") : Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        if(!global.PhantomSession.token) {
            const initialUrl = await Linking.getInitialURL();
            //console.log("initurl:",initialUrl);
            Linking.addEventListener("url", handleDeepLinkCallback);
        }
        
        if(global.PhantomSession.token && !force) {
            console.log('already have a phantom session. set force=true to get a new session');
            resolve();
            return;
        }
        

        callDeepLinkMethod(DeepLinkMethod.connect, null, resolve, deepLinkReturnRoute);             
    });
}

/** signs a transaction
 * @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signTransaction = async (transaction: Transaction, requireAllSignatures = true, verifySignatures = true, deepLinkReturnRoute = "") => {
    return new Promise<Transaction>(async (resolve) => {
        if(global.PhantomIsAndroid)
            connect(true, deepLinkReturnRoute);

        const serializedTransaction = bs58.encode(
            transaction.serialize({requireAllSignatures, verifySignatures})
        );

        const payload = {
            session: global.PhantomSession.token,
            transaction: serializedTransaction,
        };

        callDeepLinkMethod(DeepLinkMethod.signTransaction, payload, resolve, deepLinkReturnRoute);     
    });
}

/** signs a message
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signMessage = async (message: string, deepLinkReturnRoute = "") => {
return new Promise<any>(async (resolve) => {
    if(global.PhantomIsAndroid)
        connect(true, deepLinkReturnRoute);
    
    const payload = {
        session: global.PhantomSession.token,
        message: bs58.encode(Buffer.from(message)),
    };

    callDeepLinkMethod(DeepLinkMethod.signMessage, payload, resolve, deepLinkReturnRoute); 
});
};

/** signs and sends a transaction
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signAndSendTransaction = async (transaction: Transaction, requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
return new Promise<Transaction>(async (resolve) => {
    if(global.PhantomIsAndroid)
        connect(true, deepLinkReturnRoute);

    const serializedTransaction = transaction.serialize({requireAllSignatures, verifySignatures});

    const payload = {
        session: global.PhantomSession.token,
        transaction: bs58.encode(serializedTransaction),
    };

    callDeepLinkMethod(DeepLinkMethod.signAndSendTransaction, payload, resolve, deepLinkReturnRoute);
});
};

/** signs all transactions
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signAllTransactions = async (transactions: Transaction[], requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
    return new Promise<Transaction[]>(async (resolve) =>{ 
        if(global.PhantomIsAndroid)
            connect(true, deepLinkReturnRoute);

        const serializedTransactions = transactions.map((t) =>
            bs58.encode(
                t.serialize({requireAllSignatures, verifySignatures})
            )
        );

        const payload = {
            session: global.PhantomSession.token,
            transactions: serializedTransactions,
        };

        callDeepLinkMethod(DeepLinkMethod.signAllTransactions, payload, resolve, deepLinkReturnRoute);
    });
};

/** disconnects session from Phantom wallet
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const disconnect = async (deepLinkReturnRoute: string, ) => {
    return new Promise<void>(async (resolve) =>{
        const payload = {
            session: global.PhantomSession.token,
        };

        callDeepLinkMethod(DeepLinkMethod.disconnect, payload, resolve, deepLinkReturnRoute = "");
    });
  };
