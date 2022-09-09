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
import WalletInterface from './WalletInterface';
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;



export class LocalWallet implements WalletInterface {
    private keypair: Keypair;
    private connection = new Connection(clusterApiUrl("devnet"));

    constructor(keypair: Keypair, network: string) {
        if(!network)
            throw new Error("network must be specified");

        this.keypair = keypair; 
    }
    

    /** gets the last retrieved wallet public key*/
    getWalletPublicKey = (): PublicKey|null => {console.log('getting key: ', this.keypair.publicKey); return this.keypair.publicKey;}
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
    *
    signMessage = async (message: string, deepLinkReturnRoute = "") => {
        return new Promise<any>(async (resolve, reject) => {
            const kp = this.getWalletKeyPair();
            if(!kp){
                reject('not connected to a wallet');
                return;
            }

            throw new Error("not implemented");        
        });
};
*/

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

            console.log('signing and sending with ', kp.publicKey.toBase58());

            const serializedTransaction = transaction.serialize({requireAllSignatures, verifySignatures});

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