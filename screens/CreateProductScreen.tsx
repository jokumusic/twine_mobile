import { useCallback, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import * as Phantom from '../api/Phantom';


import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";


export default function CreateProductScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();

  const createProduct = async ()=>{
    console.log('creating product...');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Product</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.body}>
        <TextInput placeholder='Name'/>
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1}} 
        placeholder='Description'
        multiline={true}
        numberOfLines={4}/>
      </View>
      <View style={styles.container}>
       
        <Button title='Create Product' onPress={createProduct} />
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