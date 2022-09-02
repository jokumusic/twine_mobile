import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import * as twine from '../api/twine';


const SCREEN_DEEPLINK_ROUTE = "edit_product";


export default function EditProductScreen(props) {
  const [product, setProduct] = useState(props.route.params.product);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);

  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);


  const readProduct = async () => {
    setActivityIndicatorIsVisible(true);
    console.log('reading product...');

    const refreshedProduct = await twine
      .getProductByAddress(product.address, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>Alert.alert('error', err));

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
      .catch(err=>Alert.alert('error', err));

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>

      <View style={styles.inputSection}>
        
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.inputBox}
          value={product.name}
          onChangeText={(t)=>setProduct({...product,  name: t})}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.inputBox}
          multiline={true}
          numberOfLines={4}
          value={product.description}
          onChangeText={(t)=>setProduct({...product,  description: t})}
        />

        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput
          style={styles.inputBox}
          value={product.data?.img}
          onChangeText={(t)=>setProduct({...product, data:{...product.data, img: t}})} 
        />
   
        <Text style={styles.inputLabel}>USDC:</Text>
        <TextInput
          style={styles.inputBox}
          value={product.price}
          keyboardType='numeric'       
          onChangeText={(t)=>setProduct({...product,  price: t})}
        />
        
        <Text style={styles.inputLabel}>SKU#</Text>
        <TextInput
          style={styles.inputBox}
          value={product.data?.sku}
          onChangeText={(t)=>setProduct({...product, data: {...product.data, sku: t}})}/>
      </View>

      <View>
        <Button title='Read Product' onPress={readProduct} />
        <Button title='Update Product' onPress={updateProduct} />
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
