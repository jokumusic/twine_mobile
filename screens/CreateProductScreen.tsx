import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import * as twine from '../api/twine';
import RadioGroup from 'react-native-radio-buttons-group';
import { PublicKey } from '@solana/web3.js';
import { publicKey } from '../dist/browser/types/src/coder/spl-token/buffer-layout';
import { Modal } from 'react-native-paper';


const SCREEN_DEEPLINK_ROUTE = "create_product";

const redemptionTypeChoices = [
  { id:'0', label:'Immediate', value: 0},
  { id:'1', label:'In Person', value: 1},
]

export default function CreateProductScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [product, setProduct] = useState<twine.Product>({store: store?.address})
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [redemptionType, setRedemptionType] = useState(redemptionTypeChoices);
  const [secondaryAuthority, setSecondaryAuthority] = useState("");
  const [payTo, setPayTo] = useState("");


/*
  useEffect(()=>{
    setProduct()
  },[]);
  */
  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);

  //validates inputs and sets them in the product object if needed
  function validateInputs(){
    if(!product.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if(!product.description){
      Alert.alert("Error", 'Description is required');
      return;
    }

    const selectedRedemptionType = redemptionType.find(t=>t.selected === true);
    console.log('r: ', selectedRedemptionType);
    if(selectedRedemptionType == undefined || ![0,1].includes(selectedRedemptionType.value)){
      Alert.alert('Error', 'Redemption Type is required');
      return;
    } else{
      setProduct({...product, redemptionType: selectedRedemptionType.value});
      console.log("product redemption type set to ", product.redemptionType);
    }

    if(!product.data?.img){
      Alert.alert("Error", 'Image is required');
      return;
    }

    if(product.price < 0){
      Alert.alert("Error", 'Price must be greater than or equal to 0');
      return;
    }

    if(product.inventory < 1){
      Alert.alert("Error", 'Quantity must be greater than 0');
      return;
    }
    
    if(payTo !== "") {
      try {
        const a = new PublicKey(payTo);
        setProduct({...product, payTo: a});
      }catch(err){
        Alert.alert("Error", 'Send Payment To address is invalid');
        return;
      }
    }

    if(secondaryAuthority !== ""){
      try{
        const a = new PublicKey(secondaryAuthority);
        setProduct({...product, secondaryAuthority: a});
      }catch(err) {
        Alert.alert('error', 'Secondary Authority address is invalid');
        return;
      }
    }

    log('all inputs look good!');
  }


  async function createProduct() {
    setActivityIndicatorIsVisible(true);
    log('creating product...');
    
    const createdProduct= await twine
      .createProduct(product as twine.WriteableProduct, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>Alert.alert("error", err));

      if(createdProduct) {
        setProduct(createdProduct);
        log(JSON.stringify(createdProduct));
      } else {
        log('no product was returned');
      }

    setActivityIndicatorIsVisible(false);
    log('done');
  }

  const refreshProduct = async () => {
    setActivityIndicatorIsVisible(true);
    console.log('reading product...');

    const refreshedProduct = await twine
      .getProductByAddress(product?.address, SCREEN_DEEPLINK_ROUTE)
      .catch(log);

    if(refreshedProduct) {
      setProduct(refreshedProduct);
      log(JSON.stringify(refreshedProduct));
    }
    else {
      log("no product was returned");
    }

    setActivityIndicatorIsVisible(false);
    log('done');
  }

  const updateProduct = async()=>{
    setActivityIndicatorIsVisible(true);
    log('updating product data...');
    
    const updatedProduct = await twine
      .updateProduct(product, SCREEN_DEEPLINK_ROUTE)
      .catch(log);

    if(updatedProduct) {
      setProduct(updatedProduct);
      log(JSON.stringify(updatedProduct));
    }
    else {
      log("a product wasn't returned")
    }
    
    setActivityIndicatorIsVisible(false);
    log('done');
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>

      <View style={styles.inputSection}>
      <ScrollView>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput 
            style={styles.inputBox}
            placeholder='name of the product'
            value={product?.name}
            onChangeText={(t)=>setProduct({...product,  name: t})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput 
            placeholder='description of the product'
            style={styles.inputBox}       
            multiline={true}
            numberOfLines={4}
            value={product?.description}
            onChangeText={(t)=>setProduct({...product,  description: t})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Redemption Type</Text>
          <RadioGroup 
              radioButtons={redemptionTypeChoices} 
              onPress={setRedemptionType} 
              containerStyle={{flexDirection: 'row', justifyContent: 'flex-start'}}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Image URL</Text>
          <TextInput
            style={styles.inputBox}
            placeholder='http://'
            value={product?.data?.img}
            onChangeText={(t)=>setProduct({...product, data:{...product?.data, img: t}})} 
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Price</Text>
          <TextInput
            placeholder='price in USDC...'
            style={styles.inputBox}
            value={product?.price?.toString()}
            keyboardType='numeric'
            onChangeText={(t)=>setProduct({...product,  price: parseInt(t)})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            placeholder='how many are available?'
            style={styles.inputBox}
            value={product?.inventory?.toString()}
            keyboardType='numeric'
            onChangeText={(t)=>setProduct({...product,  inventory: parseInt(t)})}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Send Payment To</Text>
          <TextInput
            placeholder='(OPTIONAL) account address to send payments to'
            style={styles.inputBox}
            value={payTo}
            onChangeText={setPayTo}/>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Secondary Authority</Text>
          <TextInput
            placeholder="(OPTIONAL) address of another account that you authoritze to edit this product"
            style={styles.inputBox}
            value={secondaryAuthority}
            onChangeText={setSecondaryAuthority}/>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>SKU#</Text>
          <TextInput
            style={styles.inputBox}
            value={product?.data?.sku}
            onChangeText={(t)=>setProduct({...product,  data: {...product?.data, sku: t}})}/>
        </View>

      </ScrollView>
      </View>

      <View style={{flexDirection: 'row', alignContent: 'space-between', justifyContent: 'space-between', padding: 5}}>       
          <Button title='Create Product' onPress={createProduct} />        
          <Button title='Refresh' onPress={refreshProduct} />
          <Button title='Update Product' onPress={updateProduct} />                
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
    </View>
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