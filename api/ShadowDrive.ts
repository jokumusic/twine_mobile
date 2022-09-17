import {ShdwDrive} from "@shadow-drive/sdk";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Mint } from "../constants/Mints";
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import Solana from "./Solana";
import WalletInterface from "./WalletInterface";

const SHADOW_DRIVE_VERSION = "v2";

export class ShadowDrive {
    private wallet: WalletInterface;
    private connection: Connection;
    private drive: ShdwDrive; 
    private solana: Solana;
    private mint = Mint.SHDW;

    constructor(wallet?: WalletInterface) { //(network:string, wallet: WalletInterface) {
        if(wallet)
            this.wallet = wallet;

        //this.connection = new Connection(clusterApiUrl(network));
        this.connection = new Connection("https://ssc-dao.genesysgo.net/", "max");
        this.solana = new Solana("mainnet-beta");
        /*this.initDrive(this.connection, wallet)
        .then(d=>{
            this.drive = d;
        });*/
    }

    setWallet(wallet:WalletInterface) {
        this.wallet = wallet;
        /*this.initDrive(this.connection, wallet)
            .then(d=>{
                this.drive = d;
            });*/
    }

    private async initDrive(connection: Connection, wallet: WalletInterface){
        if(!this.wallet)
            return;

        const shdwDrive = new ShdwDrive(connection, {
            signTransaction: (tx: Transaction) => this.wallet.signTransaction(tx,false,true, ""),
            signAllTransactions: (txs: Transaction[]) => this.wallet.signAllTransactions(txs,false,true,""),
            publicKey: this.wallet.getWalletPublicKey(),
        });

        return await shdwDrive  
            .init()
            .catch(e=>{
                throw new Error(e);
            });
    }

    async createAccount(name:string, size:string) {
		try {
			const result = await this.drive.createStorageAccount(name, size, SHADOW_DRIVE_VERSION);
			return result.transaction_signature;
		} catch (e) {
			console.log(e);
		}
	}

    async getStorageAccounts() {
        return this.drive.getStorageAccounts(SHADOW_DRIVE_VERSION);
    }

    async uploadFile(data: any) {
        const pubkey = this.wallet.getWalletPublicKey();
        return this.drive.uploadFile(pubkey, data, SHADOW_DRIVE_VERSION);        
    }

    async getTokenAccount(walletPubkey: PublicKey) {
        return this.solana.getTokenAccount(new PublicKey(this.mint.address), walletPubkey);
    }

    async getTokenBalance(walletPubkey: PublicKey) {
        console.log('shadow mint: ', this.mint.address);
        return this.solana.getTokenBalance(new PublicKey(this.mint.address), walletPubkey);
    }

    private bytesToHuman(bytes: any, si = false, dp = 1) {
        const thresh = si ? 1024 : 1024;
    
        if (Math.abs(bytes) < thresh) {
            return bytes + " B";
        }
    
        const units = si
            ? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
            : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
        let u = -1;
        const r = 10 ** dp;
    
        do {
            bytes /= thresh;
            ++u;
        } while (
            Math.round(Math.abs(bytes) * r) / r >= thresh &&
            u < units.length - 1
        );
    
        return bytes.toFixed(dp) + " " + units[u];
    }
}