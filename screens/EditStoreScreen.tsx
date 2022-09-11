import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput } from '../components/Themed';
import * as twine from '../api/Twine';
import { PublicKey } from '@solana/web3.js';
import { RadioGroup } from 'react-native-radio-buttons-group';
import { TwineContext } from '../components/TwineProvider';
import { Dialog, Button, Image } from '@rneui/themed';
//import * as ImagePicker from 'expo-image-picker';


const SCREEN_DEEPLINK_ROUTE = "edit_store";

export default function EditStoreScreen(props) {
  const twineContext = useContext(TwineContext);
  const [store, setStore] = useState<twine.Store>(props.route.params?.store ?? {});
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const isProgramInitialized = useRef(true);
  const focusComponent = useRef();
  const [pickedImage, setPickedImage] = useState(null);
  const [secondaryAuthority, setSecondaryAuthority] = useState(store?.secondaryAuthority?.toBase58() ?? "");
  const [storeStatusChoices, setStoreStatusChoices] = useState(
    Object
    .values(twine.StoreStatus)
    .filter(v=> !isNaN(Number(v)))
    .map(v => ({id:v , label: twine.StoreStatus[v], value: Number(v), selected: store?.status == v}))
  );

  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);



function validateInputs() {
  let validatedStore = {...store};
  
  if(!store?.data?.displayName){
    log('a name is required');
    return false;
  }

  if(!store?.data?.displayDescription){
    log('a description is required.')
    return false;
  }

  if(!store?.data?.img){
    log('an image is required');
    return false;
  }

  if(secondaryAuthority !== ""){
    try{
      const a = new PublicKey(secondaryAuthority);
      validatedStore = {...validatedStore, secondaryAuthority: a};
    }catch(err) {
      Alert.alert('error', 'Secondary Authority address is invalid');
      return;
    }
  }

  
  const selectedStoreStatus = storeStatusChoices.find(t=>t.selected == true);
  if(!selectedStoreStatus) {
    Alert.alert('Error', 'Status is required');
    return false;
  } 
  else {
    validatedStore = {...validatedStore, status: selectedStoreStatus.value};
  }

  log('all inputs look good!');

  return validatedStore;
}

async function createStore() {
  const validatedStore = validateInputs();
  if(!validatedStore)
    return;

  log('creating store...');
  setShowLoadingDialog(true);

  twineContext
    .createStore(validatedStore, SCREEN_DEEPLINK_ROUTE)
    .then(setStore)
    .catch(log)
    .finally(()=>{
      setShowLoadingDialog(false);
      log('done');
    })
}

const refreshStore = async () => {
  if(!store?.address) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('reading store...');
  setShowLoadingDialog(true);
  
  const refreshedStore = await twineContext
    .getStoreByAddress(store.address)
    .catch(log);
   
  if(refreshedStore) {
    setStore(refreshedStore);
    log(JSON.stringify(store));
  }

  setShowLoadingDialog(false);
  log('done');
}

const updateStore = async() =>{
  const validatedStore = validateInputs();
  if(!validatedStore)
    return;

  if(!store?.address) {
    log("store doesn't exist. The store must be created first.");
    return;
  }

  log('updating store...');
  setShowLoadingDialog(true);
  
  const updatedStore = await twineContext
    .updateStore(validatedStore, SCREEN_DEEPLINK_ROUTE)
    .catch(log);  

  if(updatedStore) {
    setStore(updatedStore);
    log(JSON.stringify(updatedStore));
  } else {
    log("didn''t receive store data");
  }  

  setShowLoadingDialog(false);
  log('done');
}

/*const pickImage = async () => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  console.log(result);

  if (!result.cancelled) {
    setPickedImage(result.uri);
  }
};
*/

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
       
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
      
      <View style={styles.inputSection}>
      <ScrollView>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput 
            placeholder='store name...'
            style={styles.inputBox}
            value={store?.data?.displayName}
            onChangeText={(t)=>setStore({...store, data: {...store?.data, displayName: t}})}
            />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Description</Text> 
          <TextInput
            placeholder="store description..."
            style={styles.inputBox}          
            multiline={true}
            numberOfLines={3}
            value={store?.data?.displayDescription}
            onChangeText={(t)=>setStore({...store, data:{...store?.data, displayDescription: t}})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Image</Text>
          <TextInput 
            placeholder='http://'
            style={styles.inputBox}
            value={store?.data?.img}
            onChangeText={(t)=>setStore({...store, data:{...store?.data, img: t}})}
          />
{/*
          <Button title="Pick an image" onPress={pickImage} />
            {pickedImage && <Image source={{ uri: pickedImage }} style={{ width: 200, height: 200 }} />}
  */}     
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Secondary Authority</Text>
          <TextInput
            placeholder="(OPTIONAL) address of another account that you authoritze to edit this store"
            style={styles.inputBox}
            value={secondaryAuthority}
            onChangeText={setSecondaryAuthority}/>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Status</Text>
          <RadioGroup 
              radioButtons={storeStatusChoices} 
              onPress={setStoreStatusChoices} 
              containerStyle={{flexDirection: 'row', justifyContent: 'flex-start'}}
          />
        </View>
        

      </ScrollView>
      </View>
    
      <View style={{flexDirection: 'row', alignContent: 'space-between', justifyContent: 'space-between', padding: 5}}>
        <Button 
          type="solid"         
          buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
          onPress={store?.address ? updateStore : createStore}        
        >
          {store?.address ? 'Update' : 'Create'}
        </Button>
        
        <Button 
          onPress={refreshStore}
          type="solid"         
          buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
        >
          Refresh
        </Button>   
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
  },
  inputRow:{
    margin: 5,
  }
});
