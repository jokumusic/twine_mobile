import React, {createContext, useRef, useState} from 'react';
import {
    Twine,
    AssetType,
    Store, WriteableStore, StoreData, WriteableStoreData,
    Product, WriteableProduct, ProductData, WriteableProductData 
} from '../api/Twine';
import { PublicKey } from '@solana/web3.js';
import { PhantomWallet } from '../api/PhantomWallet';
import { SolChat } from '../api/SolChat';


//import { getProduct } from './services/ProductsService.js';

export const TwineContext = createContext();
const wallet = new PhantomWallet("devnet");

export function TwineProvider(props) {
    const twine = useRef(new Twine(wallet)).current;
    const solchat = useRef(new SolChat(wallet, "devnet")).current;
    const [itemCount, setItemCount] = useState(0);
    const [walletPubkey, setWalletPubkey] = useState(twine.getCurrentWalletPublicKey());
    const [lastCreatedStore, setLastCreatedStore] = useState<twine.Store>();
    const [lastUpdatedStore, setLastUpdatedStore] = useState<twine.Store>();
    const [lastCreatedProduct, setLastCreatedProduct] = useState<twine.Product>();
    const [lastUpdatedProduct, setLastUpdatedProduct] = useState<twine.Product>();
  
    async function connectWallet(force=false, deeplinkRoute: string) {
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