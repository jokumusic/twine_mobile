import React, { useCallback, useRef, useState } from 'react';
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
  const [product, setProduct] = useState(
    {
     name:'',
     description:'',
     img:'',
     price: 0,
     sku: '',
    });
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);

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

  async function createProduct() {
    setActivityIndicatorIsVisible(true);
    log('creating product...');
    
    const data = await twine
      .createProduct({...product, storeId: store.id}, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));

      if(data){
        setProduct(data);
        log(JSON.stringify(data));
      } else{
        log('no product was returned');
      }

    setActivityIndicatorIsVisible(false);
    log('done');
  }

  const readProduct = async () => {
    setActivityIndicatorIsVisible(true);
    console.log('reading product...');

    const data = await twine
      .readProduct(product.id, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));

    if(data) {
      setProduct(data);
      log(JSON.stringify(data));
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
    
    const data = await twine
      .updateProduct(product, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));

    if(data) {
      setProduct(data);
      log(JSON.stringify(data));
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
          value={product.name}
          onChangeText={(t)=>setProduct({...product,  name: t})}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput 
          placeholder='description of the product'
          style={styles.inputBox}       
          multiline={true}
          numberOfLines={4}
          value={product.description}
          onChangeText={(t)=>setProduct({...product,  description: t})}
        />

        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput
          style={styles.inputBox}
          placeholder='http://'
          value={product.img}
          onChangeText={(t)=>setProduct({...product, img: t})} 
        />
        
        <Text style={styles.inputLabel}>USDC</Text>
        <TextInput
          style={styles.inputBox}
          value={product.price}
          keyboardType='numeric'
          onChangeText={(t)=>setProduct({...product,  price: t})}
        />
        
        <Text style={styles.inputLabel}>SKU#</Text>
        <TextInput
          style={styles.inputBox}
          value={product.sku}
          onChangeText={(t)=>setProduct({...product,  sku: t})}/>
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