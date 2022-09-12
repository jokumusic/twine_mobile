import {ShdwDrive} from "@shadow-drive/sdk";
import { clusterApiUrl, Connection, Transaction } from "@solana/web3.js";
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import WalletInterface from "./WalletInterface";

const SHADOW_DRIVE_VERSION = "v2";

export class ShadowDrive {
    private wallet: WalletInterface;
    //private connection: Connection;
    private drive: ShdwDrive; 

    constructor(wallet: WalletInterface) { //(network:string, wallet: WalletInterface) {
        this.wallet = wallet;
        //this.connection = new Connection(clusterApiUrl(network));
        const connection = new Connection(
            "https://ssc-dao.genesysgo.net/",
            "max"
        );
        
        new ShdwDrive(connection, {publicKey: this.wallet.getWalletPublicKey()})
            .init()
            .then(d=>this.drive = d)
            .catch(e=>{
                throw new Error(e);
            });
    }

    setWallet(wallet:WalletInterface) {
        this.wallet = wallet;
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