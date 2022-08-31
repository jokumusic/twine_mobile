import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import uuid from 'react-native-uuid';
import * as Linking from "expo-linking";
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine } from '../target/types/twine';
import * as web3 from "@solana/web3.js";
import {generateRandomString} from '../utils/random';
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
} from "@solana/web3.js";
import { Buffer, resolveObjectURL } from "buffer";

global.Buffer = global.Buffer || Buffer;
global.LocalKeypair= (()=>{
    const keypair = Keypair.generate();
    return keypair;
})();

const network = clusterApiUrl("devnet")
const connection = new Connection(network);

interface CallbackHandler{
    resolve: Function,
    reject: Function,
}

interface RegisteredCallbackHandler extends CallbackHandler {
    date: Date;
}


/** gets the last retrieved wallet public key*/
export const getWalletPublicKey = (): PublicKey|null => global.LocalKeypair.publicKey;
const getWalletKeyPair = () : Keypair => global.LocalKeypair;

/** connects to wallet
 * @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const connect = async (force=false, deepLinkReturnRoute = "") => {
    return new Promise<PublicKey>(async (resolve,reject) => {
       resolve (getWalletPublicKey());        
    });
}

/** signs a transaction
 * @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signTransaction = async (transaction: Transaction, requireAllSignatures = true, verifySignatures = true, deepLinkReturnRoute = "") => {
    return new Promise<Transaction>(async (resolve, reject) => {
        const localKeyPair = getWalletKeyPair();
        if(!localKeyPair){
            reject('not connected to a wallet');
            return;
        }

        transaction.partialSign(localKeyPair);
        resolve(transaction);     
    });
}

/** signs a message
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signMessage = async (message: string, deepLinkReturnRoute = "") => {
    return new Promise<any>(async (resolve, reject) => {
        const localKeyPair = getWalletKeyPair();
        if(!localKeyPair){
            reject('not connected to a wallet');
            return;
        }

        throw new Error("not implemented");
    
    });
};

/** signs and sends a transaction
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signAndSendTransaction = async (transaction: Transaction, requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
    return new Promise<string>(async (resolve, reject) => {
        const localKeyPair = getWalletKeyPair();
        if(!localKeyPair){
            reject('not connected to a wallet');
            return;
        }

        const serializedTransaction = transaction.serialize({requireAllSignatures, verifySignatures});

        const signature = await anchor.web3
            .sendAndConfirmTransaction(connection, transaction, [localKeyPair])
            .catch(reject);

        if(!signature)
            return;

        resolve(signature);
    });
};

/** signs all transactions
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const signAllTransactions = async (transactions: Transaction[], requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
    return new Promise<Transaction[]>(async (resolve, reject) =>{ 
        const localKeyPair = getWalletKeyPair();
        if(!localKeyPair){
            reject('not connected to a wallet');
            return;
        }

        for(const trans of transactions){
            trans.partialSign(localKeyPair);
        }

        resolve(transactions);
    });
};

/** disconnects session from Phantom wallet
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
export const disconnect = async (deepLinkReturnRoute: string, ) => {
    return new Promise<void>(async (resolve,reject) =>{
        const localKeyPair = getWalletKeyPair();
        if(!localKeyPair){
            reject('not connected to a wallet');
            return;
        }

        throw new Error("not implemented yet");
    });
  };
