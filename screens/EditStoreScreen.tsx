import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import * as twine from '../api/twine';

const SCREEN_DEEPLINK_ROUTE = "edit_store";

export default function EditStoreScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  
  const updateStore = async() =>{
    console.log('updating store...');
    setActivityIndicatorIsVisible(true);
    const data = store;
    const storeData = await twine
      .updateStore(data, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));  
  
      if(storeData) {
        setStore(storeData);
        console.log(JSON.stringify(storeData));
      } else {
        console.log("didn''t receive store data");
      }  
  
    setActivityIndicatorIsVisible(false);
    console.log('done');
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
      <Text style={styles.title}>Edit Store</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.body}>
        <TextInput 
          placeholder='Name'
          value={store.name}
          onChangeText={(t)=>setStore({...store, name: t})}
          />
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}} 
          placeholder='Description'
          multiline={true}
          numberOfLines={3}
          value={store.description}
          onChangeText={(t)=>setStore({...store, description: t})}
        />
        <TextInput 
          placeholder='image url'
          value={store.img}
          onChangeText={(t)=>setStore({...store, img: t})}
        />
      </View>
      <View style={styles.container}>       
        <Button title='Save' onPress={updateStore} />
      </View>
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
