import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, findNodeHandle, AccessibilityInfo } from 'react-native';
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


import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
} from "@solana/web3.js";


const SCREEN_DEEPLINK_ROUTE = "create_store";

export default function CreateStoreScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [storeData, updateStoreData] = useState({name:'', description:''});
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [pubkey, setPubkey] = useState(PublicKey.default);
  const network = clusterApiUrl("devnet")
  const isProgramInitialized = useRef(true);
  const connection = new Connection(network);
  const [program, setProgram] = useState();
  const [metadataPda, setMetadataPda] = useState(PublicKey.default);
  const [metadataAccount, setMetadataAccount] = useState();
  const [companyNumber, setCompanyNumber] = useState(0);
  const [storeNumber, setStoreNumber] = useState(0);
  const focusComponent = useRef();

  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);


async function connectWallet(){
  Phantom
  .connect(true, SCREEN_DEEPLINK_ROUTE)
  .then(()=>{
    log('connected to wallet');
    const pk = Phantom.getWalletPublicKey();
    setPubkey(pk);
    const prog = getProgram(connection, pubkey);
    setProgram(prog);
    let [metaPda,metaPdabump] = PublicKey
    .findProgramAddressSync([anchor.utils.bytes.utf8.encode("metadata")], prog.programId);
    setMetadataPda(metaPda);
    prog
      .account
      .metaData
      .fetch(metaPda)
      .then(d=>{
        setMetadataAccount(d);
        setCompanyNumber(d.companyCount); //this number approach is flawed when there are multiple users. maybe look into creating a lookup account instead
      })
      .catch(e=>log(e));    
  })
  .catch(err=> log(err));
}

function getProgram(connection: Connection, pubkey: PublicKey){
  const wallet = {
    signTransaction: (tx: Transaction) => Phantom.signTransaction(tx,false,true, SCREEN_DEEPLINK_ROUTE),
    signAllTransactions: (txs: Transaction[]) => Phantom.signAllTransactions(txs,false,true,SCREEN_DEEPLINK_ROUTE),
    publicKey: pubkey
  };

  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  const program = new anchor.Program(idl as anchor.Idl, new PublicKey(idl.metadata.address), provider) as anchor.Program<Twine>;
  return program;  
}

async function createCompany() {
  setActivityIndicatorIsVisible(true);
    const pubkey = Phantom.getWalletPublicKey();

    const metadata = await program.account.metaData.fetchNullable(metadataPda);
    if(!metadata){
      log(`metadata doesn't exist: ${metadataPda.toBase58()}`);
      setActivityIndicatorIsVisible(false);
      return;
    }

    const companyNumber = metadata.companyCount;
    const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("company"),
      new Uint8Array([0,0,0,companyNumber])], program.programId);

    const company = await program.account.company.fetchNullable(companyPda).catch(e=>log(e));
    if(company) {
      log(`company #${companyNumber} already exists: ${companyPda.toBase58()}`);
      setActivityIndicatorIsVisible(false);
      return;
    }
  
    log(`creating company #${companyNumber}: ${companyPda}`);
    const tx = await program.methods
    .createCompany()
    .accounts({
      company: companyPda,
      metadata: metadataPda,
      owner: pubkey,
    })    
    .transaction()
    .catch(reason=>log(reason));

    tx.feePayer = pubkey;  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const trans = await Phantom
      .signAndSendTransaction(tx, false, true, SCREEN_DEEPLINK_ROUTE)
      .catch(error=>log(error));
    
    log(`waiting for confirmation on tx: ${trans.signature}`)
    await connection.confirmTransaction(trans.signature, 'finalized'); //wait for confirmation before trying to retrieve account data
    const createdCompany = await program.account
                                .company
                                .fetchNullable(companyPda)
                                .catch(error=>log(error));

    if(createdCompany){            
      setCompanyNumber(companyNumber);                    
      log(`company created: ${companyPda.toBase58()}`);    
      log(JSON.stringify(createdCompany));
    } else{
      log('failed to fetch company data');
    }

    setActivityIndicatorIsVisible(false);
}

async function createStore() {
  setActivityIndicatorIsVisible(true);
  const pubkey = Phantom.getWalletPublicKey();
  
  const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("company"),
    new Uint8Array([0,0,0,companyNumber])], program.programId);

  const company = await program.account.company.fetchNullable(companyPda);
  if(!company){
    log(`company #${companyNumber} doesn't exist: ${companyPda.toBase58()}`);
    setActivityIndicatorIsVisible(false);
    return;
  }
  
  const storeNumber = company.storeCount;
  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        companyPda.toBuffer(),
        new Uint8Array([0,0,0,storeNumber])], program.programId);

  const store = await program.account.store.fetchNullable(storePda);
  if(store){
    log(`store #${storeNumber} already exist: ${storePda}`);
    setActivityIndicatorIsVisible(false);
    return;
  }
  
  log(`creating store ${companyNumber}/${storeNumber}: ${companyPda}/${storePda}`); 
  const storeName = storeData.name;
  const storeDescription = storeData.description;
  
  const tx = await program.methods
  .createStore(companyNumber, storeName, storeDescription)
  .accounts({
    company: companyPda,
    store: storePda,    
    owner: pubkey,
  })  
  .transaction()
  .catch(reason=>log(reason));

  tx.feePayer = pubkey;  
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const trans = await Phantom
    .signAndSendTransaction(tx, false, true, SCREEN_DEEPLINK_ROUTE) 
    .catch(error=>log(error));

  log(`waiting for confirmation on tx: ${trans.signature}`)
  await connection.confirmTransaction(trans.signature, 'finalized'); //wait for confirmation before retrieving account data
  
  const createdStore = await program.account
                              .store
                              .fetchNullable(storePda)
                              .catch(error=>log(error));

  if(createdStore) {
    setStoreNumber(storeNumber);
    log(`store created: ${storePda.toBase58()}`);
    log(JSON.stringify(createdStore));
  } else{
    log('failed to fetch store data');
  }

  setActivityIndicatorIsVisible(false);
}

const readStore = async () => {
  setActivityIndicatorIsVisible(true);
  log('reading store data');
  const pubkey = Phantom.getWalletPublicKey();

  const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("company"),
    new Uint8Array([0,0,0,companyNumber])], program.programId);
 
  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        companyPda.toBuffer(),
        new Uint8Array([0,0,0,storeNumber])], program.programId);

  log(`store: ${companyNumber}/${storeNumber}: ${storePda.toBase58()}`);
  const store = await program.account.store.fetchNullable(storePda);
  if(!store){
    log(`store #${storeNumber} doesn't exist: ${storePda}`);
    setActivityIndicatorIsVisible(false);
    return;
  }

  updateStoreData({name: store.name, description: store.description});
                        
  log('done');
  log(JSON.stringify(store));
  setActivityIndicatorIsVisible(false);
}

const updateStore = async() =>{
  setActivityIndicatorIsVisible(true);
  log('updating store...');
  const pubkey = Phantom.getWalletPublicKey();

  const [companyPda, companyPdaBump] = PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("company"),
    new Uint8Array([0,0,0,companyNumber])], program.programId);

  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("store"),
    companyPda.toBuffer(),
    new Uint8Array([0,0,0,storeNumber])], program.programId);

  const storeName = storeData.name;
  const storeDescription = storeData.description;
  
  log(`store: ${companyNumber}/${storeNumber}: ${companyPda}/${storePda}`); 
  const tx = await program.methods
                          .updateStore(companyNumber, storeNumber, storeName, storeDescription)
                          .accounts({
                            company: companyPda,
                            store: storePda,
                            owner: pubkey,
                          })
                          .transaction()
                          .catch(reason=>log(reason));

  tx.feePayer = pubkey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
  log('submitting transaction...');
  const trans = await Phantom
                .signAndSendTransaction(tx, false, true, SCREEN_DEEPLINK_ROUTE)
                .catch(err=>log(err));  


  log(`waiting for confirmation on tx: ${trans.signature}`)
  await connection.confirmTransaction(trans.signature, 'finalized'); //wait for confirmation
  const updatedStore = await program
                              .account
                              .store
                              .fetchNullable(storePda)
                              .catch(error=>log(error));  

  if(updatedStore) {
    log('done');
    log(JSON.stringify(updatedStore));
  } else{
    log('failed to fetch store data');
  }

  setActivityIndicatorIsVisible(false);
}

  return (
    <View style={styles.container}>      
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
      
      <View style={styles.body} >
        <TextInput 
          placeholder='Name'
          value={storeData.name}
          onChangeText={(t)=>updateStoreData({...storeData, name: t})}
          />
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}} 
        placeholder='Description'
        multiline={true}
        numberOfLines={4}
        value={storeData.description}
        onChangeText={(t)=>updateStoreData({...storeData, description: t})}
        />

        <Text>The following buttons are for testing and to temporarily deal with Phantom only responding on every other call</Text>
        <Button title='Connect Wallet' onPress={connectWallet}/>
        <Button title='Create Company'  onPress={createCompany} />
        <Button title='Create Store' onPress={createStore} />
        <Button title='Read Store Data' onPress={readStore} />
        <Button title='Update Store Data' onPress={updateStore} />      
      </View>

      <View style={{width: '95%', height: '35%', margin:5}}>
        <ScrollView
            contentContainerStyle={{
              backgroundColor: "#111",
              padding: 20,
              paddingTop: 100,
              flexGrow: 1,
            }}
            ref={scrollViewRef}
            onContentSizeChange={() => {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }}
            style={{ flex: 1 }}
          >
            {logText.map((log, i) => (
              <Text
                selectable
                key={`t-${i}`}
                style={{
                  fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                  color: "#fff",
                  fontSize: 14,
                }}
              >
                {log}
              </Text>
            ))}
        </ScrollView>
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
