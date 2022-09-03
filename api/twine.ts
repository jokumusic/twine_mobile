import * as Phantom from '../api/Phantom';
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine } from '../target/types/twine';
import * as web3 from "@solana/web3.js";
import {generateRandomString, generateRandomU16, generateRandomU32, uIntToBytes} from '../utils/random';
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
//import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
//import { bs58 } from '../dist/browser/types/src/utils/bytes';

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer') //fixes an issue with react native not supporting bigint. added package big-integer to project and then added this

const network = clusterApiUrl("devnet")
const connection = new Connection(network);
const programId = new PublicKey(idl.metadata.address);

export enum RedemptionType {
    Immediate=0,
    Ticketed=1
}

export enum ProductStatus {
    Active = 0,
    Inactive = 1,
}

export enum StoreStatus {
    Active = 0,
    Inactive = 1,
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

export enum AssetType{
    SOL,
    LAMPORT,
    USDC,
}


export const getCurrentWalletPublicKey = () => Phantom.getWalletPublicKey();

export async function connectWallet(force=false, deeplinkRoute: string) {
    return new Promise<PublicKey>(async (resolve,reject) =>{
        Phantom
        .connect(force, deeplinkRoute)
        .then(resolve)
        .catch(reject);
    });
}

function getProgram(deeplinkRoute: string){
    const wallet = {
      signTransaction: (tx: Transaction) => Phantom.signTransaction(tx,false,true, deeplinkRoute),
      signAllTransactions: (txs: Transaction[]) => Phantom.signAllTransactions(txs,false,true,deeplinkRoute),
      publicKey: getCurrentWalletPublicKey(),
    };
  
    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    const program = new anchor.Program(idl as anchor.Idl, programId, provider) as anchor.Program<Twine>;
    return program;  
}

function getProgramMetadataPda() {
    return publicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("program_metadata"), 
        ], programId);
}

function getStorePda(creatorPubkey: PublicKey, storeId: number) {
    return PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("store"), 
          creatorPubkey.toBuffer(),
          Buffer.from(uIntToBytes(storeId,2,"setUint"))
        ], programId);
}

function getProductPda(creatorPubkey: PublicKey, productId: number) {
    return PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("product"),
          creatorPubkey.toBuffer(),
          Buffer.from(uIntToBytes(productId,4,"setUint"))
        ], programId);
}

function encodeData(data: any) {
    trimUndefined(data);
    const compressed = compress(data);
    const encoded = JSON.stringify(compressed);
    return encoded;
}

function decodeData(data: any) {
    const decoded = JSON.parse(data);
    const decompressed = decompress(decoded);
    return decompressed;
}

export async function createStore(store: WriteableStore, deeplinkRoute: string) {
    return new Promise<Store>(async (resolve,reject) => {
        const currentWalletPubkey = getCurrentWalletPublicKey();
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
        const [storePda, storePdaBump] = getStorePda(currentWalletPubkey, newStoreId);
        const program = getProgram(deeplinkRoute);

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
                encodeData(store.data))
            .accounts({
                store: storePda,
                creator: currentWalletPubkey,
                authority: store.authority ?? currentWalletPubkey,
                secondaryAuthority: store.secondaryAuthority ?? currentWalletPubkey,    
            })
            .transaction()
            .catch(reject);

        if(!tx)
            return;
    
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = currentWalletPubkey;
        
        console.log('signing and sending transaction...');
        const signature = await Phantom
            .signAndSendTransaction(tx, false, true, deeplinkRoute) 
            .catch(reject);

        if(!signature)
            return;
        
        console.log('waiting for finalization...');
        const confirmationResponse = await connection
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
        const createdStoreData = decodeData(createdStore.data);
        createdStore.data = createdStoreData;
        resolve({...createdStore, address: storePda});
    });
  }


export async function updateStore(store: Store, deeplinkRoute: string) {
    return new Promise<Store>(async (resolve,reject) => {
        const currentWalletPubkey = getCurrentWalletPublicKey();
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

        const program = getProgram(deeplinkRoute);
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
                encodeData(store.data))
            .accounts({
                store: store.address,
                authority: currentWalletPubkey,
            })
            .transaction()
            .catch(reject);
    
        if(!tx)
            return;

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = currentWalletPubkey;        
        
        console.log('signing and sending transaction...');
        const signature = await Phantom
                    .signAndSendTransaction(tx, false, true, deeplinkRoute)
                    .catch(reject);

        if(!signature)
            return;
        
        console.log('waiting for finalization...');
        const confirmationResponse = await connection
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
        
        updatedStore.data = decodeData(updatedStore.data);

        resolve({...updatedStore, address: store.address});        
    });
}

export async function getStoreByAddress(address: PublicKey) {
    return new Promise<Store>(async (resolve,reject) => {
        if(!address) {
            reject('a store address is required');
            return;
        }

        const program = getProgram("");
        const store = await program.account.store.fetchNullable(address)
            .catch(reject);

        if(!store){
            reject(`store doesn't exist at address: ${address}`);
            return;
        }

        const storeData = decodeData(store.data);
        store.data = storeData;
        resolve({...store, address});
    });
}



export async function createProduct(product: WriteableProduct, deeplinkRoute: string) {
    return new Promise<Product>(async (resolve,reject) => {
        const currentWalletPubkey = getCurrentWalletPublicKey();
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

        
        const program = getProgram(deeplinkRoute);
        const newProductId  = generateRandomU32();
        const [productPda, productPdaBump] = getProductPda(currentWalletPubkey, newProductId);
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
                    encodeData(product.data)
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
                    encodeData(product.data)
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

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = currentWalletPubkey;

        console.log('signing and sending transaction...');
        const signature = await Phantom
            .signAndSendTransaction(tx, false, true, deeplinkRoute)
            .catch(reject);

        if(!signature)
            return;
        
        console.log(`waiting for finalization on tx: ${signature}`)
        const confirmationResponse = await connection
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
   
        createdProduct.data = decodeData(createdProduct.data);
        resolve({...createdProduct, address: productPda, price: createdProduct.price.toNumber(), inventory: createdProduct.inventory.toNumber()});
    });
}


export async function getProductByAddress(address: PublicKey) {
    return new Promise<Product>(async(resolve,reject) => {

        if(!address) {
            reject('a product address is required');
            return;
        }

        const currentWalletPubkey = getCurrentWalletPublicKey();
        const program = getProgram("");    
        const product = await program.account.product.fetchNullable(address);
        if(!product){
            reject(`product doesn't exist at address: ${address.toBase58()}`);        
            return;
        }

        product.data = decodeData(product.data);
        resolve({...product, address: address, price: product.price.toNumber(), inventory: product.inventory.toNumber()});        
    });
}


export async function updateProduct(product: Product, deeplinkRoute: string) {
    return new Promise<Product>(async (resolve, reject) => {
        const currentWalletPubkey = getCurrentWalletPublicKey();
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


        const program = getProgram(deeplinkRoute);

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
                encodeData(product.data),
            )
            .accounts({
                product: product.address,
                authority: currentWalletPubkey,      
            })
            .transaction()
            .catch(reject);

        if(!tx)
            return;

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = currentWalletPubkey;        

        console.log('signing and sending transaction...');
        const signature = await Phantom
            .signAndSendTransaction(tx, false, true, deeplinkRoute)
            .catch(reject);

        if(!signature)
            return;

        console.log('waiting for finalization of transaction ', signature);
        const confirmationResponse = await connection.confirmTransaction(signature, 'finalized');

        const updatedProduct = await program.account.product
            .fetchNullable(product.address)
            .catch(reject);

        if(!updatedProduct)
            return;
      
        updatedProduct.data = decodeData(updatedProduct.data);
        resolve({...updatedProduct, address: product.address, price: updatedProduct.price.toNumber(), inventory: updatedProduct.inventory.toNumber()});
    });
}


export async function getStoresByName(nameStartsWith: string) {
    if(!nameStartsWith)
        return getStores();
    else
        return getStores([{
            memcmp: {
                offset: 129,
                bytes: anchor.utils.bytes.bs58.encode(Buffer.from(nameStartsWith.toLowerCase(),'utf8')),
            }
        }]);
}

export async function getProductsByName(nameStartsWith: string) {
    if(!nameStartsWith)
        return getProducts();
    else
        return getProducts([{
            memcmp: {
                offset: 237,
                bytes: anchor.utils.bytes.bs58.encode(Buffer.from(nameStartsWith.toLowerCase(),'utf8')),
            }
        }]);
}

async function getStores(filters?: Buffer | web3.GetProgramAccountsFilter[]) {
    return new Promise<Store[]>(async (resolve, reject) => {
        const list = [] as Store[];
        const program = getProgram("");
        const stores = await program.account.store
            .all(filters)
            .catch(reject);

        let regex:RegExp;


        stores.forEach(store => {  
            try 
            {
                if(store.account?.data){
                    const parsedStoreData = JSON.parse(store.account.data);                    
                    store.account.data = decompress(parsedStoreData);
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


export async function getProductsByStore(storeAddress: PublicKey, deeplinkRoute: string) {
    return new Promise<Product[]>(async (resolve, reject) => {
        let items = [] as Product[];

        if(!storeAddress) {
            reject('storeAddress is required');
            return;            
        }

        const program = getProgram(deeplinkRoute);
        const products = await program.account.product.all(
            [{
                memcmp: { 
                    offset: 184,
                    bytes: storeAddress.toBase58(),
                }
             }]
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
                    const parsedProductData = JSON.parse(product.account.data);          
                    product.account.data = decompress(parsedProductData);
                    items.push({...product.account, address: product.publicKey, price: product.account.price.toNumber(), inventory: product.account.inventory.toNumber(), account_type: "product"});          
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

async function getProducts(filters?: Buffer | web3.GetProgramAccountsFilter[], additionalFilterString?: string) {
    return new Promise<Product[]>(async (resolve, reject) => {
        console.log('twine.getProducts()');
        const list = [] as Product[];
        const program = getProgram("");
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
                    const p = {...product.account, address: product.publicKey, price: product.account.price.toNumber(), inventory: product.account.inventory.toNumber(), account_type: "product"}
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

async function getMixedItems(searchString: string) {
    return new Promise<Store[]|Product[]>(async (resolve, reject) => {
        const items = [] as Store[]|Product[];
        
        const stores = await getStoresByName(searchString)
            .catch(console.log);
        
        items.push(stores);

        const products = await getProductsByName(searchString)
            .catch(console.log);
        items.push(products);

        resolve(items);
    });
  }

  export async function getStoresByAuthority(authority: PublicKey, deeplinkRoute: string) {
    return new Promise<Store[]>(async (resolve,reject) => {
        let items = [] as Store[];
        if(!authority){
            reject('authority not specified');
            return;
        }
        
        const program = getProgram(deeplinkRoute);
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

  export async function getTopStores(n: number, searchString: string) {
    return new Promise<any[]>(async (resolve, reject) => {
        const stores = await getStoresByName(searchString)
            .catch(reject);

        if(!stores)
            return;

        const topStores = stores.slice(0, n);
        
        resolve(topStores);
    });
  }

  export async function sendAsset(assetType: AssetType, to: PublicKey, amount: number, deeplinkRoute: string) {
    return new Promise<string>(async (resolve,reject) => {
        const currentWalletPubkey = getCurrentWalletPublicKey();
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
                    fromPubkey: currentWalletKey,
                    toPubkey: to,
                    lamports: BigInt(lamports)
                }),
            );

            console.log('getting latest blockhash...');
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            tx.feePayer = currentWalletPubkey;            
    
            console.log('signing and sending transaction...');
            const signature = await Phantom
                .signAndSendTransaction(tx, false, true, deeplinkRoute)
                .catch(reject);
    
            if(!signature)
                return;

            console.log('waiting for finalization of transaction...');
            const confirmationResponse = await connection
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





