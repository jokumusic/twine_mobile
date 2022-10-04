import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import {
    Twine,
    AssetType,
    Store, WriteableStore, StoreData, WriteableStoreData,
    Product, WriteableProduct, ProductData, WriteableProductData, PurchaseTicket 
} from '../api/Twine'
import { PublicKey, Keypair } from '@solana/web3.js';
import { PhantomWallet } from '../api/PhantomWallet';
import {LocalWallet} from '../api/LocalWallet';
import { SolChat } from '../api/SolChat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletInterface from '../api/WalletInterface';
import { Buffer } from "buffer";
import TokenSwapInterface, { MintInfo } from '../api/TokenSwapInterface';
//import { JupiterSwap } from '../api/JupiterSwap';
import {MockSwap} from '../api/MockSwap';
import Solana from '../api/Solana';
import {ShadowDrive} from '../api/ShadowDrive';
import { Mint } from '../constants/Mints';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

global.Buffer = global.Buffer || Buffer;


//import { getProduct } from './services/ProductsService.js';
const NETWORK = "devnet";
export const TwineContext = createContext();

const LOCAL_KEYPAIRS_LOOKUP_KEY = "@LocalKeyPairs";
const LOCAL_KEYPAIR_DEFAULT_PUBKEY = "@LocalKeyPairDefaultPubkey";

export interface StoredLocalWallet {
    name: string,
    maxSpend: number,
    keypair: Keypair
    isDefault: boolean,
}


export function TwineProvider(props) {
    let solana = useRef<Solana>(new Solana(NETWORK)).current;
    let twine = useRef<Twine>(new Twine(NETWORK)).current;
    let solchat = useRef<SolChat>(new SolChat(NETWORK)).current;
    let tokenSwapper = useRef<TokenSwapInterface>(new MockSwap(NETWORK)).current;
    let shadowDrive = useRef<ShadowDrive>(new ShadowDrive()).current;
    const [wallet, setWallet] = useState<WalletInterface>();
    const [currentLocalWallet, setCurrentLocalWallet] = useState<StoredLocalWallet>();
    const [itemCount, setItemCount] = useState(0);
    const [walletPubkey, setWalletPubkey] = useState<PublicKey>();
    const [lastCreatedStore, setLastCreatedStore] = useState<Store>();
    const [lastUpdatedStore, setLastUpdatedStore] = useState<Store>();
    const [lastCreatedProduct, setLastCreatedProduct] = useState<Product>();
    const [lastUpdatedProduct, setLastUpdatedProduct] = useState<Product>();

    useEffect(()=>{

        const f = async () => {
            const defaultPubkey = await getDefaultWalletPubkey();
            if(!defaultPubkey) {
                console.log('no default pubkey');
                return;
            }
            
            console.log('got default pubkey:', defaultPubkey);
            let walletToUse: WalletInterface = null;

            if(defaultPubkey == "phantom") {
                walletToUse = new PhantomWallet(NETWORK);
            }
            else {
                const localWallets = await getLocalWallets();
                if(localWallets){
                    const defaultWallet = localWallets.find(w=>w.keypair.publicKey.toBase58() == defaultPubkey);
                    if(defaultWallet) {
                        setCurrentLocalWallet(defaultWallet);
                        walletToUse = new LocalWallet(defaultWallet.keypair, NETWORK);
                    }
                }
            }            

            if(walletToUse) {
                    //console.log('setting wallet');
                    setWallet(walletToUse);
                    twine.setWallet(walletToUse);
                    solchat.setWallet(walletToUse);
                    tokenSwapper.setWallet(walletToUse);
                    shadowDrive.setWallet(walletToUse);
                    setWalletPubkey(walletToUse.getWalletPublicKey());
            }
        };
              
        f();

    }, []);

    async function storeData(key:string, value) {
        try {
            await AsyncStorage.setItem(key, value); 
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

    async function getDefaultWalletPubkey() {
        return getData(LOCAL_KEYPAIR_DEFAULT_PUBKEY);
    }

    async function createLocalWallet(wallet: StoredLocalWallet){
        let existingWallets = await getLocalWallets();
        if(!existingWallets)
            existingWallets = [];

        const newWallet = {...wallet, keypair: Keypair.generate()};
        
        existingWallets.push(newWallet);
        const stringyWallets = JSON.stringify(existingWallets);
        await storeData(LOCAL_KEYPAIRS_LOOKUP_KEY, stringyWallets);
        return wallet;
    }

    async function updateLocalWallet(wallet: StoredLocalWallet) {
        let existingWallets = await getLocalWallets();
        if(!existingWallets)
            return;

        const updatedWallets = existingWallets.map(w=> w.keypair.publicKey.equals(wallet.keypair.publicKey) ? wallet : w);
        const stringyWallets = JSON.stringify(updatedWallets);
        await storeData(LOCAL_KEYPAIRS_LOOKUP_KEY, stringyWallets);
        return wallet;
    }

    async function getLocalWallets(): Promise<StoredLocalWallet[]> {
        const kpData  = await getData(LOCAL_KEYPAIRS_LOOKUP_KEY);
        const defaultPubkey = await getDefaultWalletPubkey();

        if(kpData) {
            const kpArray = JSON.parse(kpData);
            const walletsToFix = [];
            //console.log('kpArray: ', kpArray);
            const kps = kpArray.map(item => {
                try{                    
  
                    const secretKeyValues = Object.values(item.keypair._keypair.secretKey);
                    const secretKey = new Uint8Array(secretKeyValues);
                    const kp = Keypair.fromSecretKey(secretKey);
                    return {
                        name: item.name,
                        maxSpend: item?.maxSpend ?? 0,
                        keypair: kp,
                        isDefault: kp.publicKey.toBase58() == defaultPubkey
                    } as StoredLocalWallet;
                }
                catch(e) {
                    console.error(e);
                }
            });
   

            return kps;
        }

        return [] as StoredLocalWallet[];
    }

    function getCurrentWalletName() {
        return wallet?.getWalletName();
    }

    function getCurrentWalletMaxSpend() {
        return currentLocalWallet?.maxSpend || 0;
    }

    async function useLocalWallet(localWallet: StoredLocalWallet) {
        console.log('using localwallet: ', localWallet.keypair.publicKey.toBase58());
        setCurrentLocalWallet(localWallet);
        const walletToUse = new LocalWallet(localWallet.keypair, NETWORK);
        setWallet(walletToUse);
        twine.setWallet(walletToUse);
        solchat.setWallet(walletToUse);
        tokenSwapper.setWallet(walletToUse);
        shadowDrive.setWallet(walletToUse);
        await storeData(LOCAL_KEYPAIR_DEFAULT_PUBKEY, localWallet.keypair.publicKey.toBase58());

        setWalletPubkey(walletToUse.getWalletPublicKey());
    }

    async function usePhantomWallet(){
        console.log('using phantom wallet');
        const walletToUse = new PhantomWallet(NETWORK);
        setWallet(walletToUse);
        twine.setWallet(walletToUse);
        solchat.setWallet(walletToUse);
        tokenSwapper.setWallet(walletToUse);
        shadowDrive.setWallet(walletToUse);
        setWalletPubkey(null);
        setCurrentLocalWallet(null);
        await storeData(LOCAL_KEYPAIR_DEFAULT_PUBKEY, "phantom");
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
        console.log('context wallet: ', wallet?.getWalletPublicKey());
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

    async function getAccountLamports(account: PublicKey){
        return solana.getAccountLamports(account);
    }

    async function getAccountSol(account: PublicKey){
        return solana.getAccountSol(account);
    }

    async function getTokenBalance(mint: MintInfo, account: PublicKey) {
        let balance = 0;
        //console.log('getting balance for: ', mint.name);
        if(mint.name == Mint.SHDW.name){
            if(!shadowDrive)
                throw new Error("shadowDrive has not be instantiated.");
            
            balance = await shadowDrive?.getTokenBalance(account) ?? 0;
        }
        else {
            balance = await solana.getTokenBalance(new PublicKey(mint.address), account);
        }
        
        return balance / mint.multiplier;
    }

    async function getPurchaseFee() {
        return twine.getPurchaseFee();
    }

    async function initiateRedemption(purchaseTicket: PurchaseTicket, redeemQuantity: number, deeplinkRoute: "") {
        return twine.initiateRedemption(purchaseTicket, redeemQuantity, deeplinkRoute);
    }

    async function takeRedemption(redemptionAddress: PublicKey, deeplinkRoute: "") {
        return twine.takeRedemption(redemptionAddress, deeplinkRoute);
    }

    async function getRedemptionsByTicketAddress(ticketAddress: PublicKey) {
        return twine.getRedemptionsByTicketAddress(ticketAddress);
    }

    async function createProductRedemptionTaker(productAddress: PublicKey, takerAddress: PublicKey, deeplinkRoute: "") {
        return twine.createProductRedemptionTaker(productAddress, takerAddress, deeplinkRoute);
    }

    async function getRedemptionTakersByProductAddress(productAddress: PublicKey) {
        return twine.getRedemptionTakersByProductAddress(productAddress) ;
    }

    async function getProductTicketTakerAccount(productAddress: PublicKey, takerAddress: PublicKey) {
        return twine.getProductTicketTakerAccount(productAddress, takerAddress);
    }

    async function getRedemptionByAddress(redemptionAddress: PublicKey) {
        return twine.getRedemptionByAddress(redemptionAddress);
    }

    async function getPurchaseTicketByAddress(ticketAddress: PublicKey) {
        return twine.getPurchaseTicketByAddress(ticketAddress);
    }

    async function signMessage(message: string, deeplinkRoute: "") {
        return wallet?.signMessage(message, deeplinkRoute);
    }

    function signatureIsValid(message: string, signature: string, publicKey: PublicKey){
        
        return nacl.sign.detached.verify(Buffer.from(message), bs58.decode(signature), publicKey.toBytes())
    }

    function cancelRedemption(redemptionAddress: PublicKey, deeplinkRoute=""){
        return twine.cancelRedemption(redemptionAddress, deeplinkRoute);
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
            createLocalWallet,
            getLocalWallets,
            getAccountLamports,
            getAccountSol,
            getTokenBalance,
            useLocalWallet,
            usePhantomWallet,
            getCurrentWalletName,
            updateLocalWallet,
            tokenSwapper,
            getCurrentWalletMaxSpend,
            getPurchaseFee,
            initiateRedemption,
            takeRedemption,
            getRedemptionsByTicketAddress,
            createProductRedemptionTaker,
            getRedemptionTakersByProductAddress,
            getProductTicketTakerAccount,
            getRedemptionByAddress,
            getPurchaseTicketByAddress,
            signMessage,
            signatureIsValid,
            cancelRedemption,
        }}
        >
            {props.children}
        </TwineContext.Provider>
    );
}