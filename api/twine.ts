import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine as TwineProgram } from '../target/types/twine';
import * as web3 from "@solana/web3.js";
import {generateRandomString, generateRandomU16, generateRandomU32, uIntToBytes} from '../utils/random';
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import WalletInterface from './WalletInterface';
//import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
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
    readonly quantity: number;
    readonly redeemed: number;
    readonly nonce: number;
}

export interface Purchase {
    readonly purchaseTicket: PurchaseTicket;
    readonly productSnapshot: Product;
}

export enum AssetType{
    SOL,
    LAMPORT,
    USDC,
}

const programId = new PublicKey(idl.metadata.address);

export class Twine {
    private wallet: WalletInterface;
    private connection: Connection;

    constructor(wallet: WalletInterface, network: string) {
        this.wallet = wallet;
        this.connection = new Connection(clusterApiUrl(network));
    }

    getCurrentWalletPublicKey = () => this.wallet.getWalletPublicKey();

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
                    store.data.displayName.toLowerCase(),
                    store.data.displayDescription.toLowerCase(),
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
                    store.data.displayName.toLowerCase(),
                    store.data.displayDescription.toLowerCase(),
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
                    new anchor.BN(product.price),
                    new anchor.BN(product.inventory),
                    product.redemptionType, 
                    product.data.displayName.toLowerCase(),
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
                    new anchor.BN(product.price),
                    new anchor.BN(product.inventory),
                    product.redemptionType, 
                    product.data.displayName.toLowerCase(),
                    product.data.displayDescription.toLowerCase(),
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
            resolve({...createdProduct, address: productPda, price: createdProduct.price.toNumber(), inventory: createdProduct.inventory.toNumber()});
        } catch(e) {
            reject(e);
        }    
    });
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
                resolve({...product, address: address, price: product.price.toNumber(), inventory: product.inventory.toNumber()});       
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
                    new anchor.BN(product.price),
                    new anchor.BN(product.inventory),
                    product.redemptionType,
                    product.data.displayName.toLowerCase(),
                    product.data.displayDescription.toLowerCase(),
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
            resolve({...updatedProduct, address: product.address, price: updatedProduct.price.toNumber(), inventory: updatedProduct.inventory.toNumber()});
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
                            price: product.account.price.toNumber(),
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
                            price: product.account.price.toNumber(),
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
                    return {...ticket.account, address: ticket.publicKey};                
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
            const stores = await program.account.store
                .all([
                        {
                            memcmp: { offset: 43, bytes: authority.toBase58() }
                        }
                ])
                .catch(reject);

            if(!stores)
                return;
        
            stores.forEach((store,i)=>{  
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

            if(assetType == AssetType.LAMPORT || assetType == AssetType.SOL){
                let lamports: number = 0;
                if(assetType == AssetType.LAMPORT) {
                    lamports = amount;
                }
                else if(assetType == AssetType.SOL){
                    lamports = web3.LAMPORTS_PER_SOL * amount;
                }
                else {
                    reject(`unknown assetType: ${assetType}`);
                    return;
                }

                const tx = new web3.Transaction().add(
                    web3.SystemProgram.transfer({
                        fromPubkey: currentWalletPubkey,
                        toPubkey: to,
                        lamports: BigInt(lamports)
                    }),
                );

                console.log('getting latest blockhash...');
                tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
                tx.feePayer = currentWalletPubkey;            
        
                console.log('signing and sending transaction...');
                const signature = await this.wallet
                    .signAndSendTransaction(tx, false, true, deeplinkRoute)
                    .catch(reject);
        
                if(!signature)
                    return;

                console.log('waiting for finalization of transaction...');
                const confirmationResponse = await this.connection
                    .confirmTransaction(signature, 'finalized')
                    .catch(reject);

                if(!confirmationResponse)
                    return;

                resolve(signature);
                return;
            }
            else {
                reject(`sending of assetType ${assetType} is not supported`);
                return;
            }
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
            const nonce = generateRandomU16();

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
            

            let transferAmount = product.price * quantity + 100000000;

            const transferToPurchaseTicketIx = anchor.web3.SystemProgram.transfer({
                fromPubkey: currentWalletPubkey,
                toPubkey: purchaseTicketPda,
                lamports: transferAmount,
            });


            const buyProductIx = await program.methods
            .buyProduct(nonce, new anchor.BN(quantity), new anchor.BN(product.price))
            .accounts({
                //mint: loneProduct.mint,
                product: product.address,
                productSnapshotMetadata: productSnapshotMetadataPda,
                productSnapshot: productSnapshotPda,
                buyer: currentWalletPubkey,
                buyFor: currentWalletPubkey,
                payTo: product.payTo,
                purchaseTicket: purchaseTicketPda,
            })
            .instruction();

            const tx = new anchor.web3.Transaction()
            .add(transferToPurchaseTicketIx)
            .add(buyProductIx);

            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;

            console.log('signing and sending transaction...');
            const signature = await this.wallet
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);

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
}

