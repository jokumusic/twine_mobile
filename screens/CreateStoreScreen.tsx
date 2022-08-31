import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, findNodeHandle, AccessibilityInfo, KeyboardAvoidingView } from 'react-native';
import { useSelector, useDispatch, connect } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import { getCustomTabsSupportingBrowsersAsync } from 'expo-web-browser';
import * as twine from '../api/twine';

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
  const isProgramInitialized = useRef(true);
  const focusComponent = useRef();

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

function storeDataIsValid(): bool {
  if(!storeData.name){
    log('a name is required');
    return false;
  }

  if(!storeData.description){
    log('a description is required.')
    return false;
  }

  if(!storeData.img){
    log('an image is required');
    return false;
  }

  return true;
}

async function createStore() {
  if(!storeDataIsValid())
    return;

  let errored = false;

  log('creating store...');
  setActivityIndicatorIsVisible(true);

  const store = await twine
    .createStore(storeData, SCREEN_DEEPLINK_ROUTE)
    .catch(err=>{errored=true; log(err);});
  
  if(errored) {
    setActivityIndicatorIsVisible(false);
    return;
  }

  if(store) {
    setStoreData(store);
  } else {
    log("didn''t receive store data");
  }

  setActivityIndicatorIsVisible(false);
  log('done');
}

const readStore = async () => {
  if(!storeData.id) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('reading store...');
  setActivityIndicatorIsVisible(true);
  
  const store = await twine
    .readStore(storeData.id, SCREEN_DEEPLINK_ROUTE)
    .catch(err=>{log(err); return;});

    if(store) {
      setStoreData(store);
      log(JSON.stringify(store));
    } else {
      log("didn''t receive store data");
    }  
  
  setActivityIndicatorIsVisible(false);
  log('done');
}

const updateStore = async() =>{
  if(!storeDataIsValid())
    return;

  if(!storeData.id) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('updating store...');
  setActivityIndicatorIsVisible(true);
  
  const data = storeData;
  const store = await twine
    .updateStore(data, SCREEN_DEEPLINK_ROUTE)
    .catch(err=>log(err));  

    if(store) {
      setStoreData(store);
      log(JSON.stringify(store));
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

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput 
          style={styles.inputBox}
          value={storeData.name}
          onChangeText={(t)=>setStoreData({...storeData, name: t})}
          />

        <Text style={styles.inputLabel}>Description</Text> 
        <TextInput
          style={styles.inputBox}          
          multiline={true}
          numberOfLines={3}
          value={storeData.description}
          onChangeText={(t)=>setStoreData({...storeData, description: t})}
        />

        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput 
          style={styles.inputBox}
          value={storeData.img}
          onChangeText={(t)=>setStoreData({...storeData, img: t})}
        />

      </View>
    
      <View>
        <Button title='Connect Wallet' onPress={connectWallet}/>
        <Button title='Create Store' onPress={createStore} />
        <Button title='Read Store Data' onPress={readStore} />
        <Button title='Update Store Data' onPress={updateStore} />      
      </View>

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
  }
});
