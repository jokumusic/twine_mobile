import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import * as twine from '../api/twine';


const SCREEN_DEEPLINK_ROUTE = "create_product";


export default function CreateProductScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [product, setProduct] = useState<twine.Product>({store: store?.address})
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
/*
  useEffect(()=>{
    setProduct()
  },[]);
  */
  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);


  async function createProduct() {
    setActivityIndicatorIsVisible(true);
    log('creating product...');
    
    const createdProduct= await twine
      .createProduct(product as twine.WriteableProduct, SCREEN_DEEPLINK_ROUTE)
      .catch(log);

      if(createdProduct){
        setProduct(createdProduct);
        log(JSON.stringify(createdProduct));
      } else{
        log('no product was returned');
      }

    setActivityIndicatorIsVisible(false);
    log('done');
  }

  const readProduct = async () => {
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
        
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput 
          style={styles.inputBox}
          placeholder='name of the product'
          value={product?.name}
          onChangeText={(t)=>setProduct({...product,  name: t})}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput 
          placeholder='description of the product'
          style={styles.inputBox}       
          multiline={true}
          numberOfLines={4}
          value={product?.description}
          onChangeText={(t)=>setProduct({...product,  description: t})}
        />

        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput
          style={styles.inputBox}
          placeholder='http://'
          value={product?.data?.img}
          onChangeText={(t)=>setProduct({...product, data:{...product?.data, img: t}})} 
        />
        
        <Text style={styles.inputLabel}>USDC</Text>
        <TextInput
          style={styles.inputBox}
          value={product?.price?.toString()}
          keyboardType='numeric'
          onChangeText={(t)=>setProduct({...product,  price: parseInt(t)})}
        />
        
        <Text style={styles.inputLabel}>SKU#</Text>
        <TextInput
          style={styles.inputBox}
          value={product?.data?.sku}
          onChangeText={(t)=>setProduct({...product,  data: {...product?.data, sku: t}})}/>
      </View>

      <View> 
        <Button title='Create Product' onPress={createProduct} />
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
  }
});