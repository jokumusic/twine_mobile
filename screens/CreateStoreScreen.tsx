import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, findNodeHandle, AccessibilityInfo } from 'react-native';
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

async function createStore() {
  log('creating store...');
  setActivityIndicatorIsVisible(true);

  const store = await twine
    .createStore(storeData, SCREEN_DEEPLINK_ROUTE)
    .catch(err=>log(err));
  
    if(store) {
      setStoreData(store);
    } else {
      log("didn''t receive store data");
    }

  setActivityIndicatorIsVisible(false);
  log('done');
}

const readStore = async () => {
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
