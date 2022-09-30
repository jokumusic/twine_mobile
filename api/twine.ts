import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine as TwineProgram } from '../target/types/twine';
import * as web3 from "@solana/web3.js";
import { generateRandomU16, generateRandomU32, uIntToBytes} from '../utils/random';
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import WalletInterface from './WalletInterface';
import * as spl_token from "@solana/spl-token";
import * as tokenFaucetIdl from "../target/idl/tokenfaucet.json";
import type { Tokenfaucet }  from "../target/types/tokenfaucet";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Solana from './Solana';
import { Mint } from "../constants/Mints";
import { MintInfo } from "./TokenSwapInterface";
//import { bs58 } from '../dist/browser/types/src/utils/bytes';


if (typeof BigInt === 'undefined') global.BigInt = require('big-integer') //fixes an issue with react native not supporting bigint. added package big-integer to project and then added this


export enum RedemptionType {
    Immediate=1,
    Ticket=2,
    Confirmation=4,
}

export enum ProductStatus {
    Active = 0,
    Inactive = 1,
}

export enum StoreStatus {
    Active = 0,
    Inactive = 1,
}

export enum PricingStrategy {
    Fixed,
    Auction
}

export enum TicketExhaustionType {
    UsageCount=1,
    ExpirationDate=2,
}

export interface WriteableStoreData{
    displayName: string;
    displayDescription: string;
    img: string;
    images: string[];
    twitter?: string;
    instagram?: string;
    facebook?: string;
    web?: string;
    wiki?: string;
}

export interface StoreData extends WriteableStoreData {
}

export interface WriteableStore {
    status: StoreStatus;
    secondaryAuthority: PublicKey;
    tag: number;
    data: StoreData;
}

export interface Store extends WriteableStore {
    readonly address: PublicKey;
    readonly bump: number;
    readonly id: number;
    readonly creator: PublicKey;
    readonly authority: PublicKey;
    readonly productCount: number;
    readonly name: string;
    readonly description: string;
}

export interface WriteableProductData {
    displayName: string;
    displayDescription: string;
    img: string;
    images: string[];
    price: number;
    sku?: string;
}

export interface ProductData extends WriteableProductData {

}

export interface WriteableProduct {
    status: ProductStatus;
    secondaryAuthority: PublicKey;
    tag: number;
    payTo: PublicKey;
    store: PublicKey;
    price: number;
    inventory: number;
    redemptionType: RedemptionType;
    data: ProductData;
}

export interface Product extends WriteableProduct {
    readonly address: PublicKey;
    readonly bump: number;    
    readonly creator: PublicKey;   
    readonly id: number;   
    readonly isSnapshot: boolean;
    readonly authority: PublicKey;
    readonly name: string;
    readonly description: string;
}

export interface PurchaseTicket {
    readonly address: PublicKey;
    readonly bump: number;
    readonly version: number;
    readonly slot: number;
    readonly timestamp: number;
    readonly product: PublicKey;
    readonly productSnapshotMetadata: PublicKey;
    readonly productSnapshot: PublicKey;
    readonly buyer: PublicKey;
    readonly payTo: PublicKey;
    readonly authority: PublicKey;
    readonly remainingQuantity: number;
    readonly redeemed: number;
    readonly pendingRedemption: number;
    readonly nonce: number;
    readonly payment: PublicKey;
}

export interface Purchase {
    readonly purchaseTicket: PurchaseTicket;
    readonly productSnapshot: Product;
}

export interface Redemption {
    readonly address: PublicKey;
    readonly bump: number;
    readonly version: number;
    readonly initSlot: number;
    readonly closeSlot: number;
    readonly initTimestamp: number;
    readonly closeTimestamp: number;
    readonly store: PublicKey;
    readonly product: PublicKey;
    readonly productSnapshotMetadata: PublicKey;
    readonly productSnapshot: PublicKey;
    readonly purchaseTicket: PublicKey;
    readonly purchaseTicketSigner: PublicKey;
    readonly buyer: PublicKey;
    readonly payTo: PublicKey;
    readonly redeemQuantity: PublicKey;
    readonly price: number;
    readonly ticketTaker: PublicKey;
    readonly ticketTakerSigner: PublicKey;
}

export interface TicketTaker {
    readonly address: PublicKey;
    readonly bump: number;
    readonly version: number;
    readonly entityType: number;
    readonly entity: PublicKey;
    readonly authorizedBy: PublicKey;
    readonly enabledSlot: number;
    readonly enabledTimestamp: number;
    readonly disabledSlot: number;
    readonly disabledTimestamp: number;
}

export enum AssetType{
    SOL,
    USDC,
    SHDW,
}

const STORE_NAME_MAX_LEN = 100;
const STORE_DESCRIPTION_MAX_LEN = 200;
const PRODUCT_NAME_MAX_LEN = 100;
const PRODUCT_DESCRIPTION_MAX_LEN = 200;

const programId = new PublicKey(idl.metadata.address);
const tokenfauceProgramId = new PublicKey(tokenFaucetIdl.metadata.address);

export class Twine {
    private wallet: WalletInterface;
    private connection: Connection;
    private productPaymentTokenMint: MintInfo;
    private solana: Solana;

    constructor(network: string, wallet?: WalletInterface, ) {
        this.wallet = wallet;
        this.connection = new Connection(clusterApiUrl(network));

        this.solana = new Solana(network);
        this.productPaymentTokenMint = Mint.USDC;
    }

    getCurrentWalletPublicKey = () => this.wallet?.getWalletPublicKey();

    setWallet(wallet: WalletInterface) {
        this.wallet = wallet;
    }

    connectWallet = async (force=false, deeplinkRoute: string) => {
        return new Promise<PublicKey>(async (resolve,reject) =>{
            this.wallet
            .connect(force, deeplinkRoute)
            .then(resolve)
            .catch(reject);
        });
    }

    private getProgram = (deeplinkRoute: string = "") => {
        const wallet = {
            signTransaction: (tx: Transaction) => this.wallet.signTransaction(tx,false,true, deeplinkRoute),
            signAllTransactions: (txs: Transaction[]) => this.wallet.signAllTransactions(txs,false,true,deeplinkRoute),
            publicKey: this.getCurrentWalletPublicKey(),
        };
    
        const provider = new anchor.AnchorProvider(this.connection, wallet, anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(idl as anchor.Idl, programId, provider) as anchor.Program<TwineProgram>;
        return program;  
    }


    private getProgramMetadataPda = () => {
        return PublicKey.findProgramAddressSync(
            [
            anchor.utils.bytes.utf8.encode("program_metadata"), 
            ], programId);
    }

    private async getProgramMetadata() {
        const [programMetadataPda, programMetadataPdaBump] = this.getProgramMetadataPda();
        const program = this.getProgram("");
        let programMetadata = await program.account.programMetadata.fetch(programMetadataPda);
        return programMetadata;
    }

    async getPurchaseFee() : number {
        const programMetadata = await this.getProgramMetadata();
        return programMetadata.fee.toNumber() / Mint.USDC.multiplier;
    }

    private getStorePda = (creatorPubkey: PublicKey, storeId: number) => {
        return PublicKey.findProgramAddressSync(
            [
            anchor.utils.bytes.utf8.encode("store"), 
            creatorPubkey.toBuffer(),
            Buffer.from(uIntToBytes(storeId,2,"setUint"))
            ], programId);
    }

    private getProductPda = (creatorPubkey: PublicKey, productId: number) => {
        return PublicKey.findProgramAddressSync(
            [
            anchor.utils.bytes.utf8.encode("product"),
            creatorPubkey.toBuffer(),
            Buffer.from(uIntToBytes(productId,4,"setUint"))
            ], programId);
    }

    private encodeData = (data: any) => {
        trimUndefined(data);
        const compressed = compress(data);
        const encoded = JSON.stringify(compressed);
        return encoded;
    }

    private decodeData = (data: any) => {
        const decoded = JSON.parse(data);
        const decompressed = decompress(decoded);
        return decompressed;
    }

    async createStore(store: WriteableStore, deeplinkRoute: string) {
        return new Promise<Store>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            console.log('twine wallet: ', currentWalletPubkey);
            
            if(!currentWalletPubkey) {
                reject('not connected to a wallet');
                return;
            }

        
        
            if(!store.data.displayName) {
                reject("store must have a name");
                return;
            }
        
            if(!store.data.displayDescription){
                reject("store must have a description");
                return;
            }

            if(!store.data.img) {
                reject('store must have an image');
                return;
            }

            const newStoreId = generateRandomU16();
            const [storePda, storePdaBump] = this.getStorePda(currentWalletPubkey, newStoreId);
            const program = this.getProgram(deeplinkRoute);

            const existingStore = await program.account.store.fetchNullable(storePda);
            if(existingStore){
                reject(`store already exist: ${storePda.toBase58()}`);
                return;
            }

            console.log('creating transaction...');
            const tx = await program.methods
                .createStore(
                    newStoreId,
                    store.status,
                    store.data.displayName.slice(0,STORE_NAME_MAX_LEN).toLowerCase(),
                    store.data.displayDescription.slice(0,STORE_DESCRIPTION_MAX_LEN).toLowerCase(),
                    this.encodeData(store.data))
                .accounts({
                    store: storePda,
                    creator: currentWalletPubkey,
                    authority: currentWalletPubkey,
                    secondaryAuthority: store.secondaryAuthority ?? currentWalletPubkey,    
                })
                .transaction()
                .catch(reject);

            if(!tx)
                return;
        
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;
            
            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute) 
                .catch(reject);

            if(!signature)
                return;
            
            console.log('waiting for finalization...');
            const confirmationResponse = await this.connection
                .confirmTransaction(signature, 'finalized')
                .catch(reject); 
            
            if(!confirmationResponse)
                return;

            console.log('retrieving finalized data...');
            const createdStore = await program.account
                                        .store
                                        .fetchNullable(storePda)
                                        .catch(reject);
            
            if(!createdStore){
                reject('failed to fetch store data');
                return;
            }    
        
            console.log('got it!');
            const createdStoreData = this.decodeData(createdStore.data);
            createdStore.data = createdStoreData;
            resolve({...createdStore, address: storePda});
        });
    }


    async updateStore(store: Store, deeplinkRoute: string) {
        return new Promise<Store>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey) {
                reject('not connected to a wallet');
                return;
            }

            if(!store.address) {
                reject('store must contain an address');
                return;
            }
        
            if(!currentWalletPubkey.equals(store.authority) && !currentWalletPubkey.equals(store.secondaryAuthority)){
                reject("you're not authorized to update the store");
                return;
            }
        
            if(!store.data.displayName) {
                reject("store must have a name");
                return;
            }
        
            if(!store.data.displayDescription){
                reject("store must have a description");
                return;
            }

            if(!store.data.img) {
                reject('store must have an image');
                return;
            }

            const program = this.getProgram(deeplinkRoute);
            const existingStore = await program.account.store.fetchNullable(store.address);
            if(!existingStore){
                reject(`store doesn't exist: ${store.address}`);
                return;
            }

            console.log('creating transaction...');
            const tx = await program.methods
                .updateStore(
                    store.status,
                    store.data.displayName.slice(0,STORE_NAME_MAX_LEN).toLowerCase(),
                    store.data.displayDescription.slice(0,STORE_DESCRIPTION_MAX_LEN).toLowerCase(),
                    this.encodeData(store.data))
                .accounts({
                    store: store.address,
                    authority: currentWalletPubkey,
                })
                .transaction()
                .catch(reject);
        
            if(!tx)
                return;

            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;        
            
            console.log('signing and sending transaction...');
            const signature = await this.wallet
                        .signAndSendTransaction(tx, false, true, deeplinkRoute)
                        .catch(reject);

            if(!signature)
                return;
            
            console.log('waiting for finalization...');
            const confirmationResponse = await this.connection
                .confirmTransaction(signature, 'finalized')
                .catch(reject);
                
            if(!confirmationResponse)
                return;

            console.log('getting finalized account...');
            const updatedStore = await program
                .account
                .store
                .fetchNullable(store.address)
                .catch(reject);
                
            if(!updatedStore)
                return;    
            
            updatedStore.data = this.decodeData(updatedStore.data);

            resolve({...updatedStore, address: store.address});        
        });
    }

    async getStoreByAddress(address: PublicKey) {
        return new Promise<Store>(async (resolve,reject) => {
            if(!address) {
                reject('a store address is required');
                return;
            }

            const program = this.getProgram();
            const store = await program.account.store.fetchNullable(address)
                .catch(reject);

            if(!store){
                reject(`store doesn't exist at address: ${address}`);
                return;
            }

            const storeData = this.decodeData(store.data);
            store.data = storeData;
            resolve({...store, address});
        });
    }



    async createProduct(product: WriteableProduct, deeplinkRoute: string) {
        return new Promise<Product>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }

            if(!product.data.displayName) {
                reject('product must have a name');
                return;
            }

            if(!product.data.displayDescription) {
                reject('product must have a description');
                return;
            }

            if(!product.data.img) {
                reject('product must have an image');
                return;
            }

            if(product.price < 0) {
                reject('product price must be equal to or greater than 0');
                return;
            }

            if(product.inventory < 0) {
                reject('product inventory must be equal to or greater than 0');
                return;
            }

            
            const program = this.getProgram(deeplinkRoute);
            const newProductId  = generateRandomU32();
            const [productPda, productPdaBump] = this.getProductPda(currentWalletPubkey, newProductId);
            const existingProduct = await program.account.product.fetchNullable(productPda);
            if(existingProduct){
                reject(`product already exists`);
                return;
            }       

            /*
            const mintKeypair = Keypair.generate(); 
            const [productMintPda, productMintPdaBump] = PublicKey.findProgramAddressSync([
            anchor.utils.bytes.utf8.encode("product_mint"),
            mintKeypair.publicKey.toBuffer()
            ], program.programId);

            const [mintProductRefPda, mintProductRefPdaBump] = PublicKey.findProgramAddressSync([
            anchor.utils.bytes.utf8.encode("mint_product_ref"),
            mintKeypair.publicKey.toBuffer()
            ], program.programId);
            */

            let tx;

            if(product.store) 
            {
                console.log('creating store product transaction...');

                tx = await program.methods
                    .createStoreProduct(
                        newProductId,
                        product.status, //productMintDecimals, 
                        new anchor.BN(product.price * this.productPaymentTokenMint.multiplier),
                        new anchor.BN(product.inventory),
                        product.redemptionType, 
                        product.data.displayName.toLowerCase().slice(0,),
                        product.data.displayDescription.toLowerCase(),
                        this.encodeData(product.data)
                    )
                    .accounts({
                        //mint: storeProductMintPda,
                        product: productPda,
                        store: product.store,
                        creator: currentWalletPubkey,
                        authority: currentWalletPubkey,
                        secondaryAuthority: product.secondaryAuthority ?? currentWalletPubkey,
                        payTo: product.payTo ?? currentWalletPubkey,
                        //tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .transaction()
                    .catch(reject);
            } 
            else {
                console.log('creating lone product transaction...');
                tx = await program.methods
                    .createProduct(
                        newProductId,
                        product.status, //productMintDecimals, 
                        new anchor.BN(product.price * this.productPaymentTokenMint.multiplier),
                        new anchor.BN(product.inventory),
                        product.redemptionType, 
                        product.data.displayName.slice(0,PRODUCT_NAME_MAX_LEN).toLowerCase(),
                        product.data.displayDescription.slice(0,PRODUCT_DESCRIPTION_MAX_LEN).toLowerCase(),
                        this.encodeData(product.data)
                    )
                    .accounts({
                        //mint: loneProductMintPda,
                        product: productPda,
                        creator: currentWalletPubkey,
                        authority: currentWalletPubkey,
                        secondaryAuthority: product.secondaryAuthority ?? currentWalletPubkey,
                        payTo: product.payTo ?? currentWalletPubkey,
                        //tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .transaction()
                    .catch(reject);
            }

            if(!tx)
                return;

            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;

            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

            if(!signature)
                return;
            
            console.log(`waiting for finalization on tx: ${signature}`)
            const confirmationResponse = await this.connection
                .confirmTransaction(signature, 'finalized')
                .catch(reject);
            
            if(!confirmationResponse)
                return;

            console.log('retrieving finalized account data...');
            const createdProduct = await program.account
                                    .product
                                    .fetchNullable(productPda)              
                                    .catch(reject);

            if(!createdProduct)
                return;
    
            try{
                createdProduct.data = this.decodeData(createdProduct.data);
                resolve({...createdProduct, address: productPda, price: createdProduct.price.toNumber() / this.productPaymentTokenMint.multiplier, inventory: createdProduct.inventory.toNumber()});
            } catch(e) {
                reject(e);
            }    
        });
    }


    async getBalanceByAddress(address: PublicKey) {
        return this.connection.getBalance(address, 'finalized');
    }

    async getProductByAddress(address: PublicKey) {
        return new Promise<Product>(async(resolve,reject) => {

            if(!address) {
                reject('a product address is required');
                return;
            }

            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            const program = this.getProgram();    
            const product = await program.account.product.fetchNullable(address);
            if(!product){
                reject(`product doesn't exist at address: ${address.toBase58()}`);        
                return;
            }

            try{
                product.data = this.decodeData(product.data);       
                resolve({...product, address: address, price: product.price.toNumber() / this.productPaymentTokenMint.multiplier, inventory: product.inventory.toNumber()});       
            }catch(err) {
                reject(err);
            }        
        });
    }


    async updateProduct(product: Product, deeplinkRoute: string) {
        return new Promise<Product>(async (resolve, reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }

            if(!product.address){
                reject("a product address is required");
                return;
            }

            if(!product.data.displayName) {
                reject('product must have a name');
                return;
            }

            if(!product.data.displayDescription) {
                reject('product must have a description');
                return;
            }

            if(!product.data.img) {
                reject('product must have an image');
                return;
            }

            if(product.price < 0) {
                reject('product price must be equal to or greater than 0');
                return;
            }

            if(product.inventory < 0) {
                reject('product inventory must be equal to or greater than 0');
                return;
            }

            const program = this.getProgram(deeplinkRoute);

            const existingProduct = await program.account.product.fetchNullable(product.address);
            if(!existingProduct){
                reject(`product doesn't exist at address: ${product.address.toBase58()}`);            
                return;
            }

            if(!existingProduct.authority.equals(currentWalletPubkey) && !existingProduct.secondaryAuthority.equals(currentWalletPubkey)) {
                reject("you're not authorized to update the product");
                return;
            }

            console.log('creating transaction...');
            const tx = await program.methods
                .updateProduct(
                    product.status,
                    new anchor.BN(product.price * this.productPaymentTokenMint.multiplier),
                    new anchor.BN(product.inventory),
                    product.redemptionType,
                    product.data.displayName.slice(0,PRODUCT_NAME_MAX_LEN).toLowerCase(),
                    product.data.displayDescription.slice(0,PRODUCT_DESCRIPTION_MAX_LEN).toLowerCase(),
                    this.encodeData(product.data),
                )
                .accounts({
                    product: product.address,
                    authority: currentWalletPubkey,      
                })
                .transaction()
                .catch(reject);

            if(!tx)
                return;

            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;        

            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

            if(!signature)
                return;

            console.log('waiting for finalization of transaction ', signature);
            const confirmationResponse = await this.connection.confirmTransaction(signature, 'finalized');

            const updatedProduct = await program.account.product
                .fetchNullable(product.address)
                .catch(reject);

            if(!updatedProduct)
                return;
        
            updatedProduct.data = this.decodeData(updatedProduct.data);
            resolve({...updatedProduct, address: product.address, price: updatedProduct.price.toNumber() / this.productPaymentTokenMint.multiplier, inventory: updatedProduct.inventory.toNumber()});
        });
    }


    async getStoresByName(nameStartsWith: string) {
        if(!nameStartsWith)
            return this.getStores();
        else
            return this.getStores([{
                memcmp: {
                    offset: 129,
                    bytes: anchor.utils.bytes.bs58.encode(Buffer.from(nameStartsWith.toLowerCase(),'utf8')),
                }
            }]);
    }

    async getProductsByAuthority(authority: PublicKey, includeInactive = false) {
        return new Promise<Product[]>(async (resolve,reject) => {
            
            const authorityPromise = this.getProducts([
                {
                    memcmp: {
                        offset: 43, //authority
                        bytes: authority.toBase58(),
                    }
                },
                {
                    memcmp: { //not snapshot
                        offset: 119,
                        bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])),
                    }
                },
            ]);

            const authority2Promise = this.getProducts([
                {
                    memcmp: {
                        offset: 75, //secondarAuthority
                        bytes: authority.toBase58(),
                    }
                },
                {
                    memcmp: { //not snapshot
                        offset: 119,
                        bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])),
                    }
                },
            ]);

            const products = await  Promise
                .all([authorityPromise,authority2Promise])
                .catch(err=>reject(err));

            if(!products)
                return;

            const uniqueProductsMap = new Map<string,Product>();

            if(products[0].length > 0)
                products[0].forEach(p=>uniqueProductsMap.set(p.address.toBase58(),p));

            if(products[1].length > 0) {
                products[1].forEach(p=>{
                    //if(!uniqueProductsMap.has(p.address.toBase58()))
                        uniqueProductsMap.set(p.address.toBase58(),p)
                });
            }


            const uniqueProducts = [...uniqueProductsMap.values()];
            resolve(uniqueProducts);  
        });
    }

    async getProductsByName(nameStartsWith: string) {
        if(!nameStartsWith)
            return this.getProducts([
                {
                    memcmp: { //not snapshot
                        offset: 119,
                        bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])),
                    }
                }
            ]);
        else
            return this.getProducts([
                {
                    memcmp: {
                        offset: 237,
                        bytes: anchor.utils.bytes.bs58.encode(Buffer.from(nameStartsWith.toLowerCase(),'utf8')),
                    }
                    },
                    {
                        memcmp: { //not snapshot
                            offset: 119,
                            bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])),
                    }
                },
            ]);
    }

    async getStores(filters?: Buffer | web3.GetProgramAccountsFilter[]) {
        return new Promise<Store[]>(async (resolve, reject) => {
            const list = [] as Store[];
            const program = this.getProgram();
            const stores = await program.account.store
                .all(filters)
                .catch(reject);

            let regex:RegExp;


            stores.forEach(store => {  
                try 
                {
                    if(store.account?.data){                  
                        store.account.data = this.decodeData(store.account.data);
                        const st = {...store.account, address: store.publicKey, account_type: "store"};
                        list.push(st);
                    }
                }
                catch(e) {
                    //console.log('exception: ', e, store);
                    //console.log(store.account.data);
                }  
            });

            list.sort(() => 0.5 - Math.random());
            resolve(list);
        });
    }


    async getProductsByStore(storeAddress: PublicKey) {
        return new Promise<Product[]>(async (resolve, reject) => {
            let items = [] as Product[];

            if(!storeAddress) {
                reject('storeAddress is required');
                return;            
            }

            const program = this.getProgram();
            const products = await program.account.product.all(
                [{
                    memcmp: { 
                        offset: 184,
                        bytes: storeAddress.toBase58(),
                    }
                },
                {
                    memcmp: { //not snapshot
                        offset: 119,
                        bytes: anchor.utils.bytes.bs58.encode(Buffer.from([0])),
                    }
                },
                ]
            )
            .catch(reject);

            //console.log(productList);
            //const products = productList.filter(p=> p.account?.store && storeAddress.equals(p.account.store));
            
            if(!products)
                return;

            products.forEach((product,i)=>{  
                try
                {   
                    if(product.account.data) {        
                        product.account.data = this.decodeData(product.account.data);
                        items.push({
                            ...product.account,
                            address: product.publicKey,
                            price: product.account.price.toNumber() / this.productPaymentTokenMint.multiplier,
                            inventory: product.account.inventory.toNumber(),
                            account_type: "product"
                        });
                    }
                }
                catch(e) {
                    //console.log('exception: ', e);
                    //console.log(store.account.data);
                }
            });

            resolve(items);
        });
    }

    async getProducts(filters?: Buffer | web3.GetProgramAccountsFilter[], additionalFilterString?: string) {
        return new Promise<Product[]>(async (resolve, reject) => {
            const list = [] as Product[];
            const program = this.getProgram();
            const products = await program.account.product
                .all(filters)
                .catch(reject);

            if(!products)
                return;

            let regex:RegExp;

            if(additionalFilterString)
                regex = new RegExp(additionalFilterString, 'i');

            products.forEach((product) => {  
                try {      
                    if(product.account.data) {
                        const parsedProductData = JSON.parse(product.account.data);
                        product.account.data = decompress(parsedProductData);
                        const p = {
                            ...product.account,
                            address: product.publicKey,
                            price: product.account.price.toNumber() / this.productPaymentTokenMint.multiplier,
                            inventory: product.account.inventory.toNumber(),
                            account_type: "product"
                        };
                        if(regex) {
                            if(regex.test(p.name) || regex.test(p.description))
                                list.push(p) 
                        } else {   
                            list.push(p);
                        }
                    }
                }
                catch(e) {
                    //console.log('exception: ', e);
                    //console.log(product.account.data);
                }  
            });

            resolve(list);
        });
    }

    async getPurchaseTickets(filters?: Buffer | web3.GetProgramAccountsFilter[], additionalFilterString?: string) {
        return new Promise<PurchaseTicket[]>(async (resolve,reject) => {        
            
            const program = this.getProgram();
            const tickets = await program.account.purchaseTicket
                .all(filters)
                .catch(reject);

            if(!tickets)
                return;

            const items = tickets.map(ticket=>{  
                try {
                    return {...ticket.account, price: (ticket.account?.price || 0) / this.productPaymentTokenMint.multiplier,  address: ticket.publicKey};                
                }
                catch(e){
                    console.log('exception: ', e);
                }
            });

            resolve(items);
        });
    }

    async getPurchaseTicketsByAuthority(authority: PublicKey) {
        return new Promise<PurchaseTicket[]>(async (resolve,reject) => {
            if(!authority){
                reject('authority not specified');
                return;
            }
            
            const tickets = this.getPurchaseTickets([{ memcmp: { offset: 186, bytes: authority.toBase58() }}])
                .catch(reject);
            
            if(tickets)
                resolve(tickets);                  
        });  
    }

    async getPurchaseTicketsByPayTo(payTo: PublicKey) {
        return new Promise<PurchaseTicket[]>(async (resolve,reject) => {
            if(!payTo){
                reject('payTo not specified');
                return;
            }
            
            const tickets = this.getPurchaseTickets([{ memcmp: { offset: 154, bytes: payTo.toBase58() }}])
                .catch(reject);
            
            if(tickets)
                resolve(tickets);                  
        });  
    }

    async getPurchasesByPayTo(payTo: PublicKey) {
        return new Promise<Purchase[]>(async (resolve,reject) => {
            const tickets = await this.getPurchaseTicketsByPayTo(payTo)
                .catch(reject);

            if(!tickets)
                return;

            const snapshotPromises = tickets.map(ticket=>{
                return this.getProductByAddress(ticket.productSnapshot)
                    .catch(err=>console.log(err));
            });

            const snapshots = await Promise.all(snapshotPromises)
                .catch(err=>console.log(err));

            if(!snapshots) {
                reject('failed to retreive puchase ticket product snapshots');
                return;
            }

            const uniqueSnapshotsMap = new Map<string,Product>();
            snapshots.forEach(ss=>{
                if(ss?.address)
                    uniqueSnapshotsMap.set(ss.address.toBase58(),ss)
            });

            const purchases = tickets.map(ticket=>{
                return {
                    purchaseTicket: ticket,
                    productSnapshot: uniqueSnapshotsMap.get(ticket.productSnapshot.toBase58()),
                } as Purchase;
            });        
            
            resolve(purchases);        
        });
    }



    async getMixedItems(searchString: string) {
        return new Promise<Store[]|Product[]>(async (resolve, reject) => {
            const items = [] as Store[]|Product[];
            
            const stores = await this.getStoresByName(searchString)
                .catch(console.log);
            
            items.push(stores);

            const products = await this.getProductsByName(searchString)
                .catch(console.log);
            items.push(products);

            resolve(items);
        });
    }

    async getStoresByAuthority(authority: PublicKey) {
        return new Promise<Store[]>(async (resolve,reject) => {
            let items = [] as Store[];
            if(!authority){
                reject('authority not specified');
                return;
            }
            
            const program = this.getProgram();
            const storesByAuthorityPromise = program.account.store
                .all([
                        {
                            memcmp: { offset: 43, bytes: authority.toBase58() }
                        }
                ])
                .catch(reject);

            const storesBySecondaryAuthorityPromise = program.account.store
                .all([
                        {
                            memcmp: { offset: 75, bytes: authority.toBase58() }
                        }
                ])
                .catch(reject);

            const stores = await  Promise
                .all([storesByAuthorityPromise,storesBySecondaryAuthorityPromise])
                .catch(err=>reject(err));

            if(!stores)
                return;

            const uniqueStoresMap = new Map<string,any>();

            if(stores[0].length > 0)
                stores[0].forEach(s=>uniqueStoresMap.set(s.publicKey.toBase58(), s));

            if(stores[1].length > 0) {
                stores[1].forEach(s=>{
                    uniqueStoresMap.set(s.publicKey.toBase58(), s);
                });
            }

            const uniqueStores = [...uniqueStoresMap.values()];

            uniqueStores.forEach((store,i)=>{  
                try{
                    if(store.account.data){
                        const parsedStoreData = JSON.parse(store.account.data);          
                        store.account.data = decompress(parsedStoreData);
                        items.push({...store.account, address: store.publicKey, account_type: "store"});          
                    }
                }
                catch(e){
                    console.log('exception: ', e);
                    //console.log(store.account.data);
                }
            });

            resolve(items);
        });
    }

    async getTopStores(n: number, searchString: string) {
        return new Promise<any[]>(async (resolve, reject) => {
            const stores = await this.getStoresByName(searchString)
                .catch(reject);

            if(!stores)
                return;

            const topStores = stores.slice(0, n);
            
            resolve(topStores);
        });
    }

    async sendAsset(assetType: AssetType, to: PublicKey, amount: number, deeplinkRoute: string) {
        return new Promise<string>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }

            const tx = new web3.Transaction();

            if(assetType == AssetType.SOL) {
                let lamports: number = web3.LAMPORTS_PER_SOL * amount;
                const ix = web3.SystemProgram.transfer({
                        fromPubkey: currentWalletPubkey,
                        toPubkey: to,
                        lamports: BigInt(lamports)
                });

                tx.add(ix);
            }
            else {
                const mintInfo = assetType == AssetType.USDC ? Mint.USDC
                    : assetType == AssetType.SHDW ? Mint.SHDW
                    : null;

                if(!mintInfo){
                    reject("Unrecognized asset type");
                    return;
                }

                const mintPubkey = new PublicKey(mintInfo.address);

                const amountToSend = amount * mintInfo.multiplier;
                const tokenAccount = await this.solana.getTokenAccount(mintPubkey, currentWalletPubkey);
                if(!tokenAccount || tokenAccount.amount < amountToSend){
                    reject("Insufficient funds");
                    return;
                }

                const sendToAddress = await this.solana.getTokenAddress(mintPubkey, to, false);
                const sendToAccount = await this.solana.getTokenAccount(mintPubkey, to, false);
                if(!sendToAccount) {
                    const createSendToUsdcAccountIx = this.solana.createAssociatedTokenAccountInstruction(
                        mintPubkey,
                        currentWalletPubkey,
                        sendToAddress,
                        to
                    );

                    tx.add(createSendToUsdcAccountIx);
                }

                console.log('amountToSend: ', amountToSend);
                const sendTokenIx = this.solana.createTokenTransferInstruction(
                    tokenAccount.address,
                    sendToAddress,
                    currentWalletPubkey,
                    amountToSend
                );
                
                tx.add(sendTokenIx);
            }

            console.log('getting latest blockhash...');
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;            
    
            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);
    
            console.log('signature: ', signature);

            if(!signature)
                return;

            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await this.connection
                .confirmTransaction(signature, 'finalized')
                .catch(reject);

            if(!confirmationResponse)
                return;

            resolve(signature);     
        });
    }

    async buyProduct(product: Product, quantity: number, deeplinkRoute = "") {
        return new Promise<PurchaseTicket>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }
        
            const program = this.getProgram(deeplinkRoute);
            const purchaseFee = (await this.getProgramMetadata()).fee.toNumber();
            const nonce = generateRandomU16();            
            const transferAmount = product.price * this.productPaymentTokenMint.multiplier * quantity + purchaseFee;
            console.log('transferAmount: ', transferAmount);
            const [programMetadataPda, programMetadataPdaBump] = this.getProgramMetadataPda();
            const [productSnapshotMetadataPda, productSnapshotMetadataPdaBump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("product_snapshot_metadata"),
                product.address.toBuffer(),
                currentWalletPubkey.toBuffer(),
                Buffer.from(uIntToBytes(nonce,2,"setUint")),
            ], programId);      

            const [productSnapshotPda, productSnapshotPdaBump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("product_snapshot"),
                productSnapshotMetadataPda.toBuffer(),
            ], programId);

            const [purchaseTicketPda, purchaseTicketPdaBump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("purchase_ticket"),
                productSnapshotMetadataPda.toBuffer(),
                currentWalletPubkey.toBuffer(),
                Buffer.from(uIntToBytes(nonce,2,"setUint"))
            ], programId);
        
            const paymentMintPubkey = new PublicKey(this.productPaymentTokenMint.address);
            const payerAtaAddress = await this.solana.getTokenAddress(paymentMintPubkey, currentWalletPubkey, false);
           
            const purchaseTicketAtaAddress = await this.solana.getTokenAddress(paymentMintPubkey, purchaseTicketPda, true);
            const createPurchaseTicketAtaIx = this.solana.createAssociatedTokenAccountInstruction(
                paymentMintPubkey,
                currentWalletPubkey,
                purchaseTicketAtaAddress,
                purchaseTicketPda,
            );
            const transferToPurchaseTicketAtaIx = this.solana.createTokenTransferInstruction(
                payerAtaAddress,
                purchaseTicketAtaAddress,
                currentWalletPubkey,
                transferAmount
            );


            const payToAtaAddress = await this.solana.getTokenAddress(paymentMintPubkey, product.payTo, false);
            const payToAta = await this.solana.getTokenAccount(paymentMintPubkey, product.payTo, false);        

            const tx = new anchor.web3.Transaction()
                .add(createPurchaseTicketAtaIx)
                .add(transferToPurchaseTicketAtaIx);

            if(!payToAta) {
                console.log("payTo ATA doesn't exist. adding instruction to create it");
                const createPayToAtaIx = this.solana.createAssociatedTokenAccountInstruction(
                    paymentMintPubkey,
                    currentWalletPubkey,
                    payToAtaAddress,
                    product.payTo,
                );
                
                tx.add(createPayToAtaIx);
            } 
            else {
                //console.log('payTo ATA: ', payToAta.address.toBase58());
            }

            const programMetadata = await program.account.programMetadata.fetch(programMetadataPda);
            const feeAccountPubkey = programMetadata.feeAccount;
            const feeTokenAccountPubkey = await spl_token.getAssociatedTokenAddress(
                paymentMintPubkey, feeAccountPubkey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)           
      
            const agreedPrice = product.price * this.productPaymentTokenMint.multiplier;
            console.log('agreedPrice', agreedPrice);

            const buyProductIx = await program.methods
            .buyProduct(nonce, new anchor.BN(quantity), new anchor.BN(agreedPrice))
            .accounts({
                product: product.address,
                productSnapshotMetadata: productSnapshotMetadataPda,
                productSnapshot: productSnapshotPda,
                buyer: currentWalletPubkey,
                buyFor: currentWalletPubkey,
                payTo: product.payTo,
                payToTokenAccount: payToAtaAddress,
                purchaseTicket: purchaseTicketPda,
                purchaseTicketPayment: purchaseTicketAtaAddress,
                purchaseTicketPaymentMint: paymentMintPubkey,
                programMetadata: programMetadataPda,
                feeTokenAccount: feeTokenAccountPubkey,
                feeAccount: feeAccountPubkey,                
            })
            .instruction();

            tx.add(buyProductIx);
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;

            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

            console.log('purchase signature: ', signature);
            if(!signature)
                return;

            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await this.connection
                .confirmTransaction(signature, 'finalized')
                .catch(reject);

            if(!confirmationResponse)
                return;
    
            const purchaseTicket = await program.account
                .purchaseTicket
                .fetch(purchaseTicketPda)
                .catch(reject);

            if(!purchaseTicket)
                return;
    
            resolve({...purchaseTicket, address: purchaseTicketPda});
        });
    }

 

    async initiateRedemption(ticket: PurchaseTicket, redeemQuantity: number, deeplinkRoute: "") {
        return new Promise<Redemption>(async (resolve,reject) => {
            if(redeemQuantity > ticket.remainingQuantity) {
                reject(`Not enough redemptions remain(${ticket.remainingQuantity}) in PurchaseTicket for ${redeemQuantity} redemptions`);
                return;
            }

            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }
            
            const program = this.getProgram("");
            const paymentTokenMintAddress = new PublicKey(this.productPaymentTokenMint.address);
            const [redemptionPda, redemptionPdaBump] = PublicKey.findProgramAddressSync(
                [
                  anchor.utils.bytes.utf8.encode("redemption"),
                  ticket.address.toBuffer(),
                  new anchor.BN(ticket.remainingQuantity).toArrayLike(Buffer, 'be', 8),
                ], program.programId);

                console.log('programId: ', program.programId.toBase58());
                console.log('ticket addr: ', ticket.address.toBase58());
                console.log('tick auth: ', ticket.authority.toBase58());
                console.log('tick pay: ', ticket.payment.toBase58());
                console.log('tick mint: ', paymentTokenMintAddress.toBase58());
                console.log('tick snap meta: ', ticket.productSnapshotMetadata.toBase58());
                console.log('tick buyer: ', ticket.buyer.toBase58());
                console.log('tick nonce: ', ticket.nonce);
                console.log('redemption addr: ', redemptionPda.toBase58());
            

            const tx = await program.methods
                .initiateRedemption(new anchor.BN(redeemQuantity))
                .accounts({
                    redemption: redemptionPda,
                    purchaseTicket: ticket.address,
                    purchaseTicketAuthority: ticket.authority,
                    purchaseTicketPayment: ticket.payment,
                    purchaseTicketPaymentMint: paymentTokenMintAddress,
                })
                .transaction();
            
            tx.feePayer = currentWalletPubkey;          
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const txSignature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

            console.log('initiate redemption signature: ', txSignature);            
            if(!txSignature)
                return;

            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await this.connection
                .confirmTransaction(txSignature, 'finalized')
                .catch(reject);

            if(!confirmationResponse)
                return;
    
            const redemption = await program.account
                .redemption
                .fetch(redemptionPda)
                .catch(reject);

            if(!redemption)
                return;
    
            resolve({...redemption, address: redemptionPda});
        });
    }

    private getRedemptions(filters?: Buffer | web3.GetProgramAccountsFilter[], additionalFilterString?: string) {
        return new Promise<Redemption[]>(async (resolve,reject) => {            
            const program = this.getProgram();
            const redemptions = await program.account.redemption
                .all(filters)
                .catch(reject);

            if(!redemptions)
                return;

            const items = redemptions.map(redemption=>{  
                try {
                    return {...redemption.account, address: redemption.publicKey};                
                }
                catch(e){
                    console.log('exception: ', e);
                }
            });

            resolve(items);
        });
    }

    async getRedemptionsByTicketAddress(ticketAddress: PublicKey) {
        return new Promise<Redemption[]>(async (resolve,reject) => {
            if(!ticketAddress){
                reject('ticketAddress not specified');
                return;
            }
            
            const redemptions = await this.getRedemptions([{ memcmp: { offset: 170, bytes: ticketAddress.toBase58() }}])
                .catch(reject);
            
            resolve(redemptions);
        });        
    }

    async createProductRedemptionTaker(productAddress: PublicKey, takerAddress: PublicKey, deeplinkRoute: "") {
        return new Promise<TicketTaker>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }

            const program = this.getProgram(deeplinkRoute);
            const [ticketTakerPda, ticketTakerPdaBump] = PublicKey.findProgramAddressSync(
                [
                  anchor.utils.bytes.utf8.encode("product_taker"),
                  productAddress.toBuffer(),
                  takerAddress.toBuffer(),        
                ], program.programId);


            const tx = await program.methods
                .createProductTicketTaker()
                .accounts({
                    ticketTaker: ticketTakerPda,
                    taker: takerAddress,
                    product: productAddress,
                    productAuthority: currentWalletPubkey,
                })
                .transaction();

            tx.feePayer = currentWalletPubkey;          
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const txSignature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);
    
            console.log('created product redemption taker signature: ', txSignature);            
            if(!txSignature)
                return;
    
            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await this.connection
                .confirmTransaction(txSignature, 'finalized')
                .catch(reject);

            if(!confirmationResponse)
                return;
    
            const ticketTaker = await program.account.ticketTaker
                .fetch(ticketTakerPda)
                .catch(reject);

            if(!ticketTaker)
                return;
        
            resolve({...ticketTaker, address: ticketTakerPda});
        });
    }


    private getRedemptionTakers(filters?: Buffer | web3.GetProgramAccountsFilter[], additionalFilterString?: string) {
        return new Promise<TicketTaker[]>(async (resolve,reject) => {            
            const program = this.getProgram();
            const takers = await program.account.ticketTaker
                .all(filters)
                .catch(reject);

            if(!takers)
                return;

            const items = takers.map(taker=>{  
                try {
                    return {...taker.account, address: taker.publicKey};                
                }
                catch(e){
                    console.log('exception: ', e);
                }
            });

            resolve(items);
        });
    }

    async getRedemptionTakersByProductAddress(productAddress: PublicKey) {
        return new Promise<TicketTaker[]>(async (resolve,reject) => {
            if(!productAddress){
                reject('productAddress not specified');
                return;
            }
            
            const takers = await this.getRedemptionTakers([{ memcmp: { offset: 43, bytes: productAddress.toBase58() }}])
                .catch(reject);
            
            resolve(takers);
        });        
    }



    async takeRedemption(redemptionAddress: PublicKey, deeplinkRoute: "") {
        return new Promise<Redemption>(async (resolve,reject) => {
            const currentWalletPubkey = this.getCurrentWalletPublicKey();
            if(!currentWalletPubkey){
                reject('not connected to a wallet.');
                return;
            }

            const program = this.getProgram("");
            const redemption = await program.account.redemption.fetch(redemptionAddress);
            const purchaseTicket = await program.account.purchaseTicket.fetch(redemption.purchaseTicket);
            const paymentTokenMintAddress = new PublicKey(this.productPaymentTokenMint.address);
            const payToTokenAccountAddress = await spl_token.getAssociatedTokenAddress(paymentTokenMintAddress, redemption.payTo, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            const [productTicketTakerPda, productTicketTakerPdaBump] = PublicKey.findProgramAddressSync(
              [
                anchor.utils.bytes.utf8.encode("product_taker"),
                purchaseTicket.product.toBuffer(),
                currentWalletPubkey.toBuffer(),        
              ], program.programId);
            const [storeTicketTakerPda, storeTicketTakerPdaBump] = PublicKey.findProgramAddressSync(
              [
                anchor.utils.bytes.utf8.encode("store_taker"),
                purchaseTicket.store.toBuffer(),
                currentWalletPubkey.toBuffer(),        
              ], program.programId);
  
            let ticketTakerAddress = productTicketTakerPda;
            let ticketTakerAccount = await program.account.ticketTaker.fetchNullable(productTicketTakerPda);
            
            if(!ticketTakerAccount) {
              ticketTakerAddress = storeTicketTakerPda;
              ticketTakerAccount = await program.account.ticketTaker.fetchNullable(storeTicketTakerPda);
            }

            if(!ticketTakerAccount){
                reject('not authorized to take redemption');
                return;
            }
    
            const tx = await program.methods
            .takeRedemption()
            .accounts({
              purchaseTicket: redemption.purchaseTicket,
              redemption: redemptionAddress,
              ticketTaker: ticketTakerAddress,
              ticketTakerSigner: currentWalletPubkey,
              purchaseTicketPayment: purchaseTicket.payment,
              purchaseTicketPaymentMint: paymentTokenMintAddress,
              payToTokenAccount: payToTokenAccountAddress,
              payTo: redemption.payTo,
            })
            .transaction();
        
            tx.feePayer = currentWalletPubkey;          
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const txSignature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

            console.log('initiate redemption signature: ', txSignature);            
            if(!txSignature)
                return;

            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await this.connection
                .confirmTransaction(txSignature, 'finalized')
                .catch(reject);

            if(!confirmationResponse)
                return;
    
            const updatedRedemption = await program.account
                .redemption
                .fetch(redemptionAddress)
                .catch(reject);

            if(!redemption)
                return;
    
            resolve({...updatedRedemption, address: redemptionAddress});            
        });
    }


}

