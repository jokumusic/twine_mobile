import * as Phantom from '../api/Phantom';
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
import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
import { rejects } from 'assert';


export interface WriteableStore{
    name: string;
    description: string;
    img: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    web?: string;
    wiki?: string;
}

export interface Store extends WriteableStore {
    readonly id: string;  
    readonly rating: number;
}

export interface WriteableProduct {
    storeId?: string;
    name: string;
    description: string;
    img: string;
    price: number;
    sku?: string;
}

export interface Product extends WriteableProduct {
    readonly id: string;
    readonly rating: number;
}

const network = clusterApiUrl("devnet")
const connection = new Connection(network);
const programId = new PublicKey(idl.metadata.address);

export const getCurrentWalletPublicKey = () => Phantom.getWalletPublicKey();

export async function connectWallet(force=false, deeplinkRoute: string) {
    return new Promise<PublicKey>(async (resolve,reject) =>{
        Phantom
        .connect(force, deeplinkRoute)
        .then(()=>{
            resolve(getCurrentWalletPublicKey());
        })
        .catch(err=> reject(err));
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

function getStorePda(storeId: string) {
    return PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        anchor.utils.bytes.utf8.encode(storeId)
      ],  programId);
}

function getProductPda(productId: string) {
    return PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("product"),
        anchor.utils.bytes.utf8.encode(productId)
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
    const promise = new Promise<Store>(async (resolve,reject) => {
        const ownerPubkey = getCurrentWalletPublicKey();
        const newStore = {
            ...store,
            id: generateRandomString(12).toString()
        };
        console.log('newStore: ', newStore);
        const [storePda, storePdaBump] = getStorePda(newStore.id);
        const program = getProgram(deeplinkRoute);

        const existingStore = await program.account.store.fetchNullable(storePda);
        if(existingStore){
            reject(`store already exist: ${storePda.toBase58()}`);
            return;
        }

        let errored = false;
        const data = encodeData(newStore);

        console.log('creating transaction...');
        const tx = await program.methods
            .createStore(newStore.id, newStore.name, newStore.description, data)
            .accounts({
                store: storePda,    
                owner: ownerPubkey,
            })  
            .transaction()
            .catch(err=>{errored=true; reject(err); });

        if(errored)
            return;
    
        console.log('getting latest blockhash...');
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = ownerPubkey;  
        
        console.log('signing and sending transaction...');
        const trans = await Phantom
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(err=>{errored=true; reject(err);});

        if(errored)
            return;
        
        console.log('waiting for finalization...');
        await connection
            .confirmTransaction(trans.signature, 'finalized')
            .catch(err=>{errored=true; reject(err);}); 
        
        if(errored)
            return;

        console.log('retrieving finalized data...');
        const createdStore = await program.account
                                    .store
                                    .fetchNullable(storePda)
                                    .catch(err=>{errored=true; reject(err);});
    
        if(createdStore) {
            console.log('got it!');
            const createdStoreData = decodeData(createdStore.data);
            resolve({...createdStoreData, id: createdStore.storeId});
            return;            
        } else{
            reject('failed to fetch store data');
            return;
        }
    });

    return await promise;
  }


export async function readStore(storeId: string, deeplinkRoute:string) {
    const promise = new Promise<Store>((resolve,reject) => {
        if(!storeId)
            reject('a storeId is required');

        const [storePda, storePdaBump] = getStorePda(storeId);
        const program = getProgram(deeplinkRoute);
        program.account.store.fetchNullable(storePda)
        .then(existingStore=>{
            if(!existingStore){
                reject(`store doesn't exist: ${storePda}`);
                return;
            }
            const storeData = decodeData(existingStore.data);
            resolve({...storeData, id: existingStore.storeId});
        })
        .catch(err=>reject(err));
    });

    return await promise;
}

export async function updateStore(store: Store, deeplinkRoute: string) {
    const promise = new Promise<Store>(async (resolve,reject) => {
        if(!store.id)
            reject('store must contain an id');

        const ownerPubkey = getCurrentWalletPublicKey();
        const [storePda, storePdaBump] = getStorePda(store.id);
        const program = getProgram(deeplinkRoute);
        const existingStore = await program.account.store.fetchNullable(storePda);
        if(!existingStore){
            reject(`store doesn't exist: ${storePda}`);
            return;
        }

        let errored = false;
        const data = encodeData(store);

        console.log('creating transaction...');
        const tx = await program.methods
            .updateStore(store.name, store.description, data)
            .accounts({
                store: storePda,
                owner: ownerPubkey,
            })
            .transaction()
            .catch(err=>{errored=true; reject(err);});
    
        if(errored)
            return;

        console.log('getting latest blockhash...');
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = ownerPubkey;        
        
        console.log('signing and sending transaction...');
        const trans = await Phantom
                    .signAndSendTransaction(tx, false, true, deeplinkRoute)
                    .catch(err=>{errored=true; reject(err);});

        if(errored)
            return;
        
        console.log('waiting for finalization...');
        await connection
            .confirmTransaction(trans.signature, 'finalized')
            .catch(err=>{errored=true; reject(err);});
            
        if(errored)
            return;

        console.log('getting finalized account...');
        const updatedStore = await program
            .account
            .store
            .fetchNullable(storePda)
            .catch(err=>{errored=true; reject(err);});
            
        if(errored)
            return;
    
        if(updatedStore) {
            const storeData = decodeData(updatedStore.data);
            resolve({...storeData, id: updatedStore.storeId});
            return;
        } else{
            reject('failed to fetch store data');
            return;
        }
    });

    return await promise;
  }

  export async function createProduct(product: WriteableProduct, deeplinkRoute: string) {
    const promise = new Promise<Product>(async (resolve,reject) => {
        const ownerPubkey = getCurrentWalletPublicKey();
        const program = getProgram(deeplinkRoute);
        const newProduct = {...product, id: generateRandomString(12) };
        const [productPda, productPdaBump] = getProductPda(newProduct.id);
        const existingProduct = await program.account.product.fetchNullable(productPda);
        if(existingProduct){
            reject(`product already exists`);
            return;
        }       

        const mintKeypair = Keypair.generate(); 
        const [productMintPda, productMintPdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("product_mint"),
        mintKeypair.publicKey.toBuffer()
        ], program.programId);

        const [mintProductRefPda, mintProductRefPdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("mint_product_ref"),
        mintKeypair.publicKey.toBuffer()
        ], program.programId);

        const productCost = new anchor.BN(newProduct.price);
        const productMintDecimals = 2;
        const productData = encodeData(newProduct);

        const errored = false;
        let tx = null;
        console.log('product.storeId: ', product.storeId);
        if(product.storeId) {
            console.log('creating store product transaction...');
            const [storePda, storePdaBump] = getStorePda(product.storeId);
  
            tx = await program.methods
                .createStoreProduct(newProduct.id, productMintDecimals, newProduct.name, newProduct.description, productCost, newProduct.sku, productData)
                .accounts({
                    mint: mintKeypair.publicKey,
                    product: productPda,
                    productMint: productMintPda,
                    mintProductRef: mintProductRefPda,
                    store: storePda,
                    owner: ownerPubkey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    twineProgram: program.programId,
                })
                .transaction()
                .catch(err=>{errored=true; reject(err);});
          } 
          else {
            console.log('creating lone product transaction...');
            tx = await program.methods
                .createProduct(newProduct.id, productMintDecimals, newProduct.name, newProduct.description, productCost, newProduct.sku, productData)
                .accounts({
                    mint: mintKeypair.publicKey,
                    product: productPda,
                    productMint: productMintPda,
                    mintProductRef: mintProductRefPda,
                    owner: ownerPubkey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    twineProgram: program.programId,
                })
                .transaction()
                .catch(err=>{errored=true; reject(err);});
          }

        if(errored)
            return;

        console.log('getting latest blockhash...');
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = ownerPubkey;  
        
        tx.partialSign(mintKeypair)

        console.log('sending transaction to Phantom for signing...');
        const trans = await Phantom
            .signTransaction(tx, false, true, deeplinkRoute) 
            .catch(err=>{errored=true; reject(err);});

        if(errored)
            return;

        console.log('sending transaction to network...');
        const txid = await anchor.web3
            .sendAndConfirmRawTransaction(
                connection,
                trans.serialize({
                    requireAllSignatures: true,
                    verifySignatures: true,
                }),
                {skipPreflight: true}
            )
            .catch(err=>{errored= true; reject(err);});

        if(errored)
            return;


        if(txid) {
            console.log(`waiting for finalization on tx: ${txid}`)
            await connection
                .confirmTransaction(txid, 'finalized')
                .catch(err=>{errored=true; reject(err);});
            
            if(errored)
                return;

            console.log('retrieving finalized account data...');
            const createdProduct = await program.account
                                    .product
                                    .fetchNullable(productPda)              
                                    .catch(err=>{errored=true; reject(err);});

            if(errored)
                return;

            if(createdProduct){
                const createdProductData = decodeData(createdProduct.data);
                resolve({...createdProductData, id: createdProduct.productId});
                return;
            } else {
                reject('failed to fetch product data');
                return;
            }
        } 
        else
        {
            reject('sending transaction failed.');
        }
    });

    return await promise;
  }


  export async function readProduct(productId: string, deeplinkRoute: string) {
    const promise = new Promise<Product>(async(resolve,reject) => {

        if(!productId){
            reject('a productId must be specified');
            return;
        }

        const ownerPubkey = getCurrentWalletPublicKey();
        const program = getProgram(deeplinkRoute);    
        const [productPda, productPdaBump] = getProductPda(productId);
        const existingProduct = await program.account.product.fetchNullable(productPda);
        if(!existingProduct){
            reject("product doesn't exist");        
            return;
        }

        const productData = decodeData(existingProduct.data);
        resolve({...productData, id: existingProduct.productId});        
    });

    return await promise;
  }


  export async function updateProduct(product: WriteableProduct, deeplinkRoute: string) {
    const promise = new Promise<Product>(async (resolve, reject) => {
        if(!product.id){
            reject("product doesn't contain an id");
            return;
        }

        const ownerPubKey = getCurrentWalletPublicKey();
        const program = getProgram(deeplinkRoute);
        const [productPda, productPdaBump] = getProductPda(product.id);
        const existingProduct = await program.account.product.fetchNullable(productPda);
        if(!existingProduct){
            reject(`product doesn't exist: ${productPda.toBase58()}`);            
            return;
        }

        let errored=false;
        const productPrice = new anchor.BN(product.price);
        const productData = encodeData(product);

        console.log('creating transaction...');
        const tx = await program.methods
            .updateProduct(product.name, product.description, productPrice, product.sku, productData)
            .accounts({
                product: productPda,
                owner: ownerPubKey,      
            })
            .transaction()
            .catch(err=>{errored=true; rejects(err);});

        if(errored)
            return;


        console.log('getting latest blockhash...');
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = ownerPubKey;  
        

        console.log('signing and sending transaction...');
        const trans = await Phantom
            .signAndSendTransaction(tx, false, true, deeplinkRoute)
            .catch(err=>{errored=true; reject(err); });

        console.log('waiting for finalization of transaction...');
        await connection.confirmTransaction(trans.signature, 'finalized'); //wait for confirmation before trying to retrieve account data

        const updatedProduct = await program.account.product
            .fetchNullable(productPda)
            .catch(err=>{errored=true; rejects(err);});

        if(errored)
            return;

         if(updatedProduct) {
            const updatedProductData = decodeData(updatedProduct.data);
            resolve({...updatedProductData, id: updatedProduct.productId});
         }
         else {
            reject("didn't received updated product");
            return;
         }
    });

    return await promise;
  }





