import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSelector, useDispatch, connect } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import * as Phantom from '../api/Phantom';
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine } from '../target/types/twine';
import * as web3 from "@solana/web3.js";
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import { program } from '../dist/browser/types/src/spl/associated-token';
import { getCustomTabsSupportingBrowsersAsync } from 'expo-web-browser';
import { CircleActivityIndicator} from '../components/ActivityIndicator';

import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
} from "@solana/web3.js";


const twine_program = new PublicKey("ow1FPwr4YunmzcYzCswCnhVqpEiD6H32zVJMSdRsi7Q");

export default function CreateStoreScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [storeData, updateStoreData] = useState({name:'', description:''});
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
/*
  async function showAccountInfo() {
      Solana
      .getAccountInfo(settings.masterKey)
      .then((info)=> {
        if(info !== null)
          setAccountInfo(info)
      });
  }
*/

async function connectWallet(){
  Phantom
  .connect()
  .then(()=>console.log('connected to wallet'))
  .catch(err=> console.log(err));
}


function getProgram(connection: Connection, pubkey: PublicKey){
  const wallet = {
    signTransaction: Phantom.signTransaction,
    signAllTransactions: Phantom.signAllTransactions,
    publicKey: pubkey
  };

  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  const program = new anchor.Program(idl as anchor.Idl, twine_program, provider) as anchor.Program<Twine>;
  return program;  
}

async function createCompany() {    
  setActivityIndicatorIsVisible(true);
    const pubkey = Phantom.getWalletPublicKey();
    const network = clusterApiUrl("devnet")
    const connection = new Connection(network);    
    const program = getProgram(connection, pubkey);
    const [companyPda, companyPdaBump] = PublicKey
    .findProgramAddressSync([anchor.utils.bytes.utf8.encode("company"), pubkey.toBuffer()], program.programId);
    const companyInfo = await connection.getAccountInfo(companyPda);
    if(companyInfo) {
      console.log('company already exists');
      setActivityIndicatorIsVisible(false);
      return;
    }
  
    console.log('creating company...');
    const tx = await program.methods
    .createCompany()
    .accounts({
      company: companyPda,
      owner: pubkey,
    })    
    .transaction()
    .catch(reason=>console.log(reason));

    tx.feePayer = pubkey;  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    await Phantom
    .signAndSendTransaction(tx, false)
    .catch(error=>console.log(error));
    
    await connection.confirmTransaction(trans.signature); //wait for confirmation before trying to retrieve account data
    const createdCompany = await program.account
                                .store
                                .fetch(companyPda)
                                .catch(error=>console.log(error));

    console.log('company created');
    setActivityIndicatorIsVisible(true);
}

async function createStore() {
  setActivityIndicatorIsVisible(true);
  const pubkey = Phantom.getWalletPublicKey();
  const network = clusterApiUrl("devnet")
  const connection = new Connection(network);  
  const program = getProgram(connection, pubkey);
  const [companyPda, companyPdaBump] = PublicKey
  .findProgramAddressSync([anchor.utils.bytes.utf8.encode("company"), pubkey.toBuffer()], program.programId);
  const [storePda, storePdaBump] = PublicKey
    .findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        pubkey.toBuffer(),
        companyPda.toBuffer(),
        new Uint8Array([0,0,0,0])], program.programId);

  const storeInfo = await connection.getAccountInfo(storePda);
  if(storeInfo){
    console.log('store already exists');
    setActivityIndicatorIsVisible(false);
    return;
  }
    
  console.log('creating store'); 
  const storeName = storeData.name;
  const storeDescription = storeData.description;
  
  const tx = await program.methods
  .createStore(storeName, storeDescription)
  .accounts({
    company: companyPda,
    store: storePda,    
    owner: pubkey,
  })  
  .transaction()
  .catch(reason=>console.log(reason));

  tx.feePayer = pubkey;  
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const trans = await Phantom
  .signAndSendTransaction(tx, false) 
  .catch(error=>console.log(error));

  await connection.confirmTransaction(trans.signature); //wait for confirmation before retrieving account data
  
  const createdStore = await program.account
                              .store
                              .fetch(storePda)
                              .catch(error=>console.log(error));

  setActivityIndicatorIsVisible(false);
}

const readStore = async () => {
  setActivityIndicatorIsVisible(true);
  console.log('reading store');
  const pubkey = Phantom.getWalletPublicKey();
  const network = clusterApiUrl("devnet")
  const connection = new Connection(network);
  const program = getProgram(connection, pubkey);
  const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
                                                  anchor.utils.bytes.utf8.encode("company"),
                                                  pubkey.toBuffer()], program.programId);
  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
                                                anchor.utils.bytes.utf8.encode("store"),
                                                pubkey.toBuffer(),
                                                companyPda.toBuffer(),
                                                new Uint8Array([0,0,0,0])], program.programId);
    
  const store = await program.account
                        .store
                        .fetch(storePda)
                        .catch(error=>console.log(error));
  
  updateStoreData({name: store.name, description: store.description});
                        
  setActivityIndicatorIsVisible(false);
}

const updateStore = async() =>{
  setActivityIndicatorIsVisible(true);
  console.log('updating store...');
  const pubkey = Phantom.getWalletPublicKey();
  const network = clusterApiUrl("devnet");
  const connection = new Connection(network);
  const program = getProgram(connection, pubkey);

  const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
                                                  anchor.utils.bytes.utf8.encode("company"),
                                                  pubkey.toBuffer()], program.programId);
  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
                                              anchor.utils.bytes.utf8.encode("store"),
                                              pubkey.toBuffer(),
                                              companyPda.toBuffer(),
                                              new Uint8Array([0,0,0,0])], program.programId);
  const storeName = storeData.name;
  const storeDescription = storeData.description;
  const storeNumber = 0;

  const tx = await program.methods
                          .updateStore(storeNumber, storeName, storeDescription)
                          .accounts({
                            company: companyPda,
                            store: storePda,
                            owner: pubkey,
                          })
                          .transaction()
                          .catch(reason=>console.log(reason));

  tx.feePayer = pubkey;  
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
  const trans = await Phantom
                .signAndSendTransaction(tx, false)
                .catch(err=>console.log(err))

  console.log('signed trans:', trans.signature);
  console.log('waiting for confirmation...');
  await connection.confirmTransaction(trans.signature); //wait for confirmation
  const updatedStore = await program
                              .account
                              .store
                              .fetch(storePda)
                              .catch(error=>console.log(error));  

  console.log('OnChain store: ', updatedStore);
  setActivityIndicatorIsVisible(false);
}

  return (
    <View style={styles.container}>      
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
      <Text style={styles.title}>Create Store</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.body}>
        <TextInput 
          placeholder='Name'
          value={storeData.name}
          onChangeText={(t)=>updateStoreData({name: t, description: storeData.description})}
          />
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}} 
        placeholder='Description'
        multiline={true}
        numberOfLines={4}
        value={storeData.description}
        onChangeText={(t)=>updateStoreData({name: storeData.name, description: t})}
        />

        <Text>The following buttons are for testing and to temporarily deal with Phantom only responding on every other call</Text>
        <Button title='Connect Wallet' onPress={connectWallet}/>
        <Button title='Create Company'  onPress={createCompany} />
        <Button title='Create Store' onPress={createStore} />
        <Button title='Read Store Data' onPress={readStore} />
        <Button title='Update Store Data' onPress={updateStore} />
      </View>   
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  subcontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  description: {
    fontSize: 17,
  },
  accountInfo: {
    width: '90%',
    height: 75,
  },
  activityIndicatorContainer: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});
