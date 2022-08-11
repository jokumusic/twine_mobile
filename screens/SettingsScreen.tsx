import React, {useMemo, useReducer, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as Settings from '../reducers/settings';
import { RootTabScreenProps } from '../types';
import { StyleSheet } from 'react-native';
import { Text, View, TextInput, Button, FlatList } from '../components/Themed';
import Colors from '../constants/Colors';
import {Keypair, clusterApiUrl, PublicKey, PublicKeyInitData, AccountInfo} from '@solana/web3.js';
import AccountBalance from '../components/AccountBalance';


export default function SettingsScreen({ navigation }: RootTabScreenProps<'SettingsTab'>) {
  const settings = useSelector(state=>state);
  const dispatch = useDispatch();
  const [other, updateOther] = useState('');


  return (  
    <View>
      <Text>
          The following is the public key of a keypair that you have the private key to. All stores you create will be owned by this key.
          If you ever need to recover your stores, this key will allow you to do that.
          Please keep this key safe!
      </Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Other Value:</Text>
        <TextInput style={styles.fieldValue} placeholder='' value={other} onChangeText={(text) => updateOther(text)}/>
      </View>

      <View style={styles.separator}/>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
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
  root: {
    flex: 1,
    flexDirection: 'column',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    //backgroundColor: 'blue',
  },
  rowContainer: {
    flex: 1, 
    flexDirection: "column",
    //justifyContent: "space-between",
    //alignItems: "center"
  },
  text: {
    flex: 1
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white', 
    borderColor: 'black',
  },
  fieldGroup: {
    //height: 60,
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    //backgroundColor: 'blue',
  },
  fieldLabel: {
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'flex-start',
    //backgroundColor: 'green'
  },
  fieldValue: {
    flex: 4,
    flexDirection: 'row',
    //justifyContent: 'flex-end',
    alignItems: 'center',
    //backgroundColor: 'red',
    borderBottomWidth: .5
  },

});
