import React, {createContext, useEffect, useRef, useState} from 'react';
import {
    Twine,
    AssetType,
    Store, WriteableStore, StoreData, WriteableStoreData,
    Product, WriteableProduct, ProductData, WriteableProductData 
} from '../api/Twine';
import { PublicKey, Keypair } from '@solana/web3.js';
import { PhantomWallet } from '../api/PhantomWallet';
import {LocalWallet} from '../api/LocalWallet';
import { SolChat } from '../api/SolChat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletInterface from '../api/WalletInterface';
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;


//import { getProduct } from './services/ProductsService.js';
const NETWORK = "devnet";

  


export const TwineContext = createContext();

const LOCAL_KEYPAIR_LOOKUP_KEY = "@LocalKeyPair";
//const k = Keypair.generate();
//AsyncStorage.clear();

export function TwineProvider(props) {
    let wallet = useRef<WalletInterface>(new PhantomWallet(NETWORK)).current;
    const twine = useRef<Twine>(new Twine(wallet, NETWORK)).current;
    const solchat = useRef<SolChat>(new SolChat(wallet, NETWORK)).current;
    const [itemCount, setItemCount] = useState(0);
    const [walletPubkey, setWalletPubkey] = useState(wallet.getWalletPublicKey());
    const [lastCreatedStore, setLastCreatedStore] = useState<Store>();
    const [lastUpdatedStore, setLastUpdatedStore] = useState<Store>();
    const [lastCreatedProduct, setLastCreatedProduct] = useState<Product>();
    const [lastUpdatedProduct, setLastUpdatedProduct] = useState<Product>();

  

    useEffect(()=>{

        async function f() {
           
            let localKeypair;
            try{
                const kpData  = await getData(LOCAL_KEYPAIR_LOOKUP_KEY);               
                
                if(kpData) {
                    const parsedKpData = JSON.parse(kpData);
                    const parseparse = JSON.parse(parsedKpData)
                    const secretKeyValues = Object.values(parseparse._keypair.secretKey);
                    const secretKey = new Uint8Array(secretKeyValues);
                    localKeypair = Keypair.fromSecretKey(secretKey);      
                } else {
                    console.log('generating local keypair');
                    localKeypair = Keypair.generate();
                    console.log(localKeypair.publicKey.toBase58());
                    const stringyKp = JSON.stringify(localKeypair);
                    await storeData(LOCAL_KEYPAIR_LOOKUP_KEY, stringyKp);
                }
            
                console.log('localkeypair: ', localKeypair.publicKey.toBase58());
                return localKeypair;
            }
            catch(e) {
                console.error(e);
            }   
        }   

        f();
    },[]);

    async function storeData(key:string, value) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value)); 
        } catch (e) {
            console.log(e);
        }
    }

    async function getData(key:string){
        try {
            return await AsyncStorage.getItem(key);
        } catch(e) {
          console.log(e);
        }
      }
      

    async function connectWallet(force=false, deeplinkRoute: string) {
        console.log('provider connect wallet');
        return wallet
            .connect(force, deeplinkRoute)
            .then(walletKey=>{
                setWalletPubkey(walletKey);
                return walletKey;
            });
    }

    async function sendAsset(assetType: AssetType, to: PublicKey, amount: number, deeplinkRoute: string) {
        return twine.sendAsset(assetType, to, amount, deeplinkRoute);
    }

    async function getStoresByName(nameStartsWith: string) {
        return twine.getStoresByName(nameStartsWith);
    }

    async function getProductsByName(nameStartsWith: string) {
        return twine.getProductsByName(nameStartsWith);
    }

    async function getPurchaseTicketsByAuthority(authority: PublicKey) {
        return twine.getPurchaseTicketsByAuthority(authority);
    }

    async function getProductByAddress(address: PublicKey) {
        return twine.getProductByAddress(address);
    }

    async function buyProduct(product: Product, quantity: number, deeplinkRoute: string) {
        return twine.buyProduct(product, quantity, deeplinkRoute);
    }

    async function createProduct(product: WriteableProduct, deeplinkRoute: string) {
        return twine
            .createProduct(product, deeplinkRoute)
            .then(createdProduct=>{
                setLastCreatedProduct(createdProduct);
                return createdProduct;
            });
    }

    async function updateProduct(product: Product, deeplinkRoute: string) {
        return twine
            .updateProduct(product, deeplinkRoute)
            .then(updatedProduct=>{
                setLastUpdatedProduct(updatedProduct);
                return updatedProduct;
            });
    }

    async function createStore(store: WriteableStore, deeplinkRoute: string) {
        return twine
            .createStore(store, deeplinkRoute)
            .then(createdStore=>{
                setLastCreatedStore(createdStore);
                return createdStore;
            });
    }

    async function updateStore(store: Store, deeplinkRoute: string) {
        return twine
            .updateStore(store, deeplinkRoute)
            .then(updatedStore=>{
                setLastUpdatedStore(updatedStore);
                return updatedStore;
            });
    }

    async function getStoreByAddress(address: PublicKey) {
        return twine.getStoreByAddress(address);
    }



    async function getProductsByStore(storeAddress: PublicKey) {
        return twine.getProductsByStore(storeAddress);
    }

    async function getPurchasesByPayTo(payTo: PublicKey) {
        return twine.getPurchasesByPayTo(payTo);
    }

    async function getProductsByAuthority(authority: PublicKey, includeInactive = false) {
        return twine.getProductsByAuthority(authority, includeInactive);
    }

    async function getStoresByAuthority(authority: PublicKey) {
        return twine.getStoresByAuthority(authority);
    }

    return (
        <TwineContext.Provider value={{
            connectWallet,
            walletPubkey,
            sendAsset,
            getStoresByName,
            getProductsByName,
            getPurchaseTicketsByAuthority,
            getProductByAddress,
            buyProduct,
            createProduct,
            lastCreatedProduct,
            updateProduct,
            lastUpdatedProduct,
            createStore,
            lastCreatedStore,
            getStoreByAddress,
            updateStore,
            lastUpdatedStore,
            getProductsByStore,
            getPurchasesByPayTo,
            getProductsByAuthority,
            getStoresByAuthority,
            solchat,
        }}
        >
            {props.children}
        </TwineContext.Provider>
    );
}