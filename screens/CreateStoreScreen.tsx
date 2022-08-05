import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View, TextInput, Button } from '../components/Themed';
import * as Solana from '../api/solana'; 
import { useState } from 'react';
//import * as Settings from '../reducers/settings'
import { AccountInfo } from '@solana/web3.js';


export default function CreateStoreScreen() {
  const [state, updateState] = useState('')
  const [accountInfo, setAccountInfo] = useState<AccountInfo<Uint8Array>>()
  const settings = useSelector(state => state);
  const dispatch = useDispatch();

  async function showAccountInfo() {
      Solana
      .getAccountInfo(settings.masterKey)
      .then((info)=> {
        if(info !== null)
          setAccountInfo(info)
      });    
  }

  return (
    <View style={styles.container}>      
      <Text style={styles.title}>Create Store</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.body}>
        <TextInput placeholder='Name'/>
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1}} 
        placeholder='Description'
        multiline={true}
        numberOfLines={4}/>
      </View>

     <View style={styles.accountInfo}>
        <Text>SOL: {accountInfo ? accountInfo.lamports / Solana.LAMPORTS_PER_SOL : ''}.</Text>
        <Text>Executable: {accountInfo ? accountInfo.executable.toString() : ''}</Text>
      </View>

      <View style={styles.container}>
        <Button title='Create' onPress={()=> showAccountInfo()} />
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
