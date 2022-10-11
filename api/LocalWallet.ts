import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import * as anchor from "../dist/browser/index";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import WalletInterface, { SignedMessageData } from './WalletInterface';
import { Buffer } from "buffer";
import nacl from "tweetnacl";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
global.Buffer = global.Buffer || Buffer;



export class LocalWallet implements WalletInterface {
    private keypair: Keypair;
    private connection: Connection;

    constructor(keypair: Keypair, connection: Connection) {
        if(!connection)
            throw new Error("connection must be specified")
        
        this.connection = connection;
        this.keypair = keypair;
    }
    
    /** get wallet name */
    getWalletName = (): string => "Local";

    /** gets the last retrieved wallet public key*/
    getWalletPublicKey = (): PublicKey|null => this.keypair.publicKey;
    getWalletKeyPair = () : Keypair|null => this.keypair;

    /** connects to wallet
     * @param deepLinkReturnRoute deeplink route back to the screen you want to display
    */
    connect = async (force=false, deepLinkReturnRoute = "") => {
        return new Promise<PublicKey>(async (resolve,reject) => {
            const pk = this.getWalletPublicKey();
            if(!pk)
                reject('no keypair available');
            else
                resolve (pk);        
        });
    }

    /** signs a transaction
     * @param deepLinkReturnRoute deeplink route back to the screen you want to display
    */
    signTransaction = async (transaction: Transaction, requireAllSignatures = true, verifySignatures = true, deepLinkReturnRoute = "") => {
        return new Promise<Transaction>(async (resolve, reject) => {
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }

            console.log('signing with: ', kp.publicKey.toBase58());

            transaction.partialSign(kp);
            resolve(transaction);     
        });
    }

    /** signs a message
    * @param deepLinkReturnRoute deeplink route back to the screen you want to display
    */
    signMessage = async (message: string, deepLinkReturnRoute = "") => {
        return new Promise<SignedMessageData>(async (resolve, reject) => {
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }

            const signatureArray = nacl.sign.detached(Buffer.from(message), kp.secretKey);
            resolve({
                signature: bs58.encode(signatureArray)
            });
        });
    };


/** signs and sends a transaction
* @param deepLinkReturnRoute deeplink route back to the screen you want to display
*/
    signAndSendTransaction = async (transaction: Transaction, requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
        return new Promise<string>(async (resolve, reject) => {
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }            
       
            const signature = await anchor.web3
                .sendAndConfirmTransaction(this.connection, transaction, [kp])
                .catch(reject);

            if(!signature)
                return;

            resolve(signature);
        });
    };

    /** signs all transactions
    * @param deepLinkReturnRoute deeplink route back to the screen you want to display
    */
    signAllTransactions = async (transactions: Transaction[], requireAllSignatures=true, verifySignatures=true, deepLinkReturnRoute = "") => {
        return new Promise<Transaction[]>(async (resolve, reject) =>{ 
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }

            for(const trans of transactions){
                trans.partialSign(kp);
            }

            resolve(transactions);
        });
    };

    /** disconnects session from Phantom wallet
    * @param deepLinkReturnRoute deeplink route back to the screen you want to display
    *
    disconnect = async (deepLinkReturnRoute: string, ) => {
        return new Promise<void>(async (resolve,reject) =>{
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }

            throw new Error("not implemented yet");
        });
    }
    */

}