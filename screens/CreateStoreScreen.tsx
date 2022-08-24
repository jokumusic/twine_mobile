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


const SCREEN_DEEPLINK_ROUTE = "create_store";

export default function CreateStoreScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [storeData, setStoreData] = useState({
    name:'', 
    description:'',
    img: '',
  });
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [pubkey, setPubkey] = useState(PublicKey.default);
  const network = clusterApiUrl("devnet")
  const isProgramInitialized = useRef(true);
  const connection = new Connection(network);
  const [program, setProgram] = useState();
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

async function createStore() {
  setActivityIndicatorIsVisible(true);
  const pubkey = Phantom.getWalletPublicKey();
  let newStore = {
    ...storeData,
    id: generateRandomString(12).toString()
  };
  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        anchor.utils.bytes.utf8.encode(newStore.id)
      ], program.programId);

  const store = await program.account.store.fetchNullable(storePda);
  if(store){
    log(`store already exist: ${storePda}`);
    setActivityIndicatorIsVisible(false);
    return;
  }
  
  log(`creating store ${storePda}`); 
  trimUndefined(newStore);
  const compressedStore = compress(newStore);
  const dataString = JSON.stringify(compressedStore);
  const tx = await program.methods
    .createStore(newStore.id, newStore.name, newStore.description,dataString)
    .accounts({
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
    const parsedStoreData = JSON.parse(createdStore.data);
    const createdStoreData = decompress(parsedStoreData);
    setStoreData(createdStoreData);
    log(`store created: ${storePda.toBase58()}`);
    log(JSON.stringify(createdStoreData));
  } else{
    log('failed to fetch store data');
  }

  setActivityIndicatorIsVisible(false);
}

const readStore = async () => {
  if(!storeData.id) {
    log("a store hasn't been created yet. Create a store first");
    return;
  }

  setActivityIndicatorIsVisible(true);
  
  log('reading store data');
  const pubkey = Phantom.getWalletPublicKey();

  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("store"),
        anchor.utils.bytes.utf8.encode(storeData.id)
      ], program.programId);

  log(`store: ${storePda.toBase58()}`);
  const store = await program.account.store.fetchNullable(storePda);
  if(!store){
    log(`store doesn't exist: ${storePda}`);
    setActivityIndicatorIsVisible(false);
    return;
  }

  const parsedStoreData = JSON.parse(store.data);
  const decompressedStoreData = decompress(parsedStoreData);
  setStoreData(decompressedStoreData);
                        
  log('done');
  log(JSON.stringify(decompressedStoreData));
  setActivityIndicatorIsVisible(false);
}

const updateStore = async() =>{
  if(!storeData.id) {
    log("a store hasn't been created yet. Create a store first");
    return;
  }

  setActivityIndicatorIsVisible(true);
  log('updating store...');
  const pubkey = Phantom.getWalletPublicKey();

  const [storePda, storePdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("store"),
      anchor.utils.bytes.utf8.encode(storeData.id),
    ], program.programId);
  
  log(`store: ${storePda}`); 
  trimUndefined(storeData);
  const compressedData = compress(storeData);
  const jsonData = JSON.stringify(compressedData);
  const tx = await program.methods
    .updateStore(storeData.name, storeData.description, jsonData)
    .accounts({
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
    const parsedData = JSON.parse(updatedStore.data);
    const decompressedData = decompress(parsedData);
    log('done');
    log(JSON.stringify(decompressedData));
  } else{
    log('failed to fetch store data');
  }

  setActivityIndicatorIsVisible(false);
}

  return (
    <View style={styles.container}>      
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
      
      <View style={styles.body} >
        <View style={{margin: 5}}>
        <TextInput 
          placeholder='Name'
          value={storeData.name}
          onChangeText={(t)=>setStoreData({...storeData, name: t})}
          />
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}} 
          placeholder='Description'
          multiline={true}
          numberOfLines={3}
          value={storeData.description}
          onChangeText={(t)=>setStoreData({...storeData, description: t})}
        />
        <TextInput 
          placeholder='image url'
          value={storeData.img}
          onChangeText={(t)=>setStoreData({...storeData, img: t})}
        />
        </View>

        <Button title='Connect Wallet' onPress={connectWallet}/>
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
