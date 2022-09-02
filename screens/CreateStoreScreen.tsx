import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, findNodeHandle, AccessibilityInfo, KeyboardAvoidingView, Alert } from 'react-native';
import { useSelector, useDispatch, connect } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import { getCustomTabsSupportingBrowsersAsync } from 'expo-web-browser';
import * as twine from '../api/twine';
import { PublicKey } from '@solana/web3.js';

const SCREEN_DEEPLINK_ROUTE = "create_store";

export default function CreateStoreScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [store, setStore] = useState<twine.Store>({});
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const isProgramInitialized = useRef(true);
  const focusComponent = useRef();
  const [secondaryAuthority, setSecondaryAuthority] = useState("");

  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);


async function connectWallet(){
  twine.connectWallet(true, SCREEN_DEEPLINK_ROUTE)
  .then(()=>{
    log('connected to wallet');
  })
  .catch(err=> log(err));
}

function validateInputs(): bool {
  if(!store.name){
    log('a name is required');
    return false;
  }

  if(!store.description){
    log('a description is required.')
    return false;
  }

  if(!store.data?.img){
    log('an image is required');
    return false;
  }

  if(secondaryAuthority !== ""){
    try{
      const a = new PublicKey(secondaryAuthority);
      setStore({...store, secondaryAuthority: a});
    }catch(err) {
      Alert.alert('error', 'Secondary Authority address is invalid');
      return;
    }
  }

  log('all inputs look good!');

  return true;
}

async function createStore() {
  if(!validateInputs())
    return;

  log('creating store...');
  setActivityIndicatorIsVisible(true);

  twine
    .createStore(store, SCREEN_DEEPLINK_ROUTE)
    .then(createdStore=>{if(createdStore) setStore(createdStore);})
    .catch(log)
    .finally(()=>{
      setActivityIndicatorIsVisible(false);
      log('done');
    })
}

const refreshStore = async () => {
  if(!store.address) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('reading store...');
  setActivityIndicatorIsVisible(true);
  
  const refreshedStore = await twine
    .getStoreByAddress(store.address, SCREEN_DEEPLINK_ROUTE)
    .catch(log);
   
  if(refreshedStore) {
    setStore(refreshedStore);
    log(JSON.stringify(store));
  }

  setActivityIndicatorIsVisible(false);
  log('done');
}

const updateStore = async() =>{
  if(!validateInputs())
    return;

  if(!store.address) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('updating store...');
  setActivityIndicatorIsVisible(true);
  
  const updatedStore = await twine
    .updateStore(store, SCREEN_DEEPLINK_ROUTE)
    .catch(log);  

  if(updatedStore) {
    setStore(updatedStore);
    log(JSON.stringify(updatedStore));
  } else {
    log("didn''t receive store data");
  }  

  setActivityIndicatorIsVisible(false);
  log('done');
}

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
      
      <View style={styles.inputSection}>
      <ScrollView>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput 
            placeholder='store name...'
            style={styles.inputBox}
            value={store.name}
            onChangeText={(t)=>setStore({...store, name: t})}
            />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Description</Text> 
          <TextInput
            placeholder="store description..."
            style={styles.inputBox}          
            multiline={true}
            numberOfLines={3}
            value={store.description}
            onChangeText={(t)=>setStore({...store, description: t})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Image</Text>
          <TextInput 
            placeholder='http://'
            style={styles.inputBox}
            value={store.data?.img}
            onChangeText={(t)=>setStore({...store, data:{...store.data, img: t}})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Secondary Authority</Text>
          <TextInput
            placeholder="(OPTIONAL) address of another account that you authoritze to edit this store"
            style={styles.inputBox}
            value={secondaryAuthority}
            onChangeText={setSecondaryAuthority}/>
        </View>

      </ScrollView>
      </View>
    
      <View style={{flexDirection: 'row', alignContent: 'space-between', justifyContent: 'space-between', padding: 5}}>
        <Button title='Create' onPress={createStore} />
        <Button title='Refresh' onPress={refreshStore} />
        <Button title='Update' onPress={updateStore} />      
      </View>

      <Button title="validate" onPress={()=>validateInputs()} />       

      <View style={{width: '95%', height: '20%', margin:5}}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1
  },
  inputSection: {
    flex: 1,
    alignContent: 'flex-start',
    padding: 10,
  },
  inputLabel:{
    fontWeight: 'bold',
    fontSize: 12,
    alignContent:'flex-start'
  },
  inputBox:{
    borderWidth: 1,
    alignContent: 'flex-start',
    height: 40,
    marginBottom: 10,
  },
  inputRow:{
    margin: 5,
  }
});
