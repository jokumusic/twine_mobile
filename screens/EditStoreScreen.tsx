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
      
      <View style={styles.inputSection}>

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.inputBox}
          value={store.name}
          onChangeText={(t)=>setStore({...store, name: t})}
          />
        
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput 
          style={styles.inputBox}
          multiline={true}
          numberOfLines={3}
          value={store.description}
          onChangeText={(t)=>setStore({...store, description: t})}
        />
        
        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput 
          style={styles.inputBox}
          placeholder='http://'
          value={store.img}
          onChangeText={(t)=>setStore({...store, img: t})}
        />
      </View>
      
      <View>
        <Button title='Save' onPress={updateStore} />
      </View>
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //alignItems: 'center',
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
