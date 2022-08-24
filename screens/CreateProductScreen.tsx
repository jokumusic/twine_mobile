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
  const [productData, setProductData] = useState(
    {
     name:'',
     description:'',
     img:'',
     cost: 0,
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
    
    const product = await twine
      .createProduct({...productData, storeId: store.id}, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));

      if(product){
        setProductData(product);
        log(JSON.stringify(product));
      } else{
        log('no product was returned');
      }

    setActivityIndicatorIsVisible(false);
    log('done');
  }

  const readProduct = async () => {
    setActivityIndicatorIsVisible(true);
    console.log('reading product...');

    const product = await twine
      .readProduct(productData.id, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>log(err));

    if(product) {
      setProductData(product);
      log(JSON.stringify(product));
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
    
    const product = await twine
      .updateProduct(productData)
      .catch(err=>log(err));

    if(product) {
      setProductData(product);
      log(JSON.stringify(product));
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
      <View style={styles.body}>
        
        <TextInput placeholder='Name'
          style={{margin: 5}}
          value={productData.name}
          onChangeText={(t)=>setProductData({...productData,  name: t})}
        />

        <TextInput placeholder='Description'
          style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}}        
          multiline={true}
          numberOfLines={4}
          value={productData.description}
          onChangeText={(t)=>setProductData({...productData,  description: t})}
        />

        <TextInput 
          placeholder='image url'
          value={productData.img}
          onChangeText={(t)=>setProductData({...productData, img: t})} 
        />
        
        <Text>lamports:</Text>
        <TextInput placeholder='cost in lamports'
          value={productData.cost.toString()}
          keyboardType='numeric'
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}}
          onChangeText={(t)=>setProductData({...productData,  cost: +t})}
        />
        
        <TextInput
          placeholder='SKU#'
          value={productData.sku}
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}} 
          onChangeText={(t)=>setProductData({...productData,  sku: t})}/>
      </View>
      <View> 
        <Button title='Connect Wallet' onPress={connectWallet}/>
        <Button title='Create Product' onPress={createProduct} />
        <Button title='Read Product' onPress={readProduct} />
        <Button title='Update Product' onPress={updateProduct} />
      </View>

      <Text>This is will create a lone product(not associated to a store)</Text>
      
      <View style={{width: '95%', height: '35%', margin:5}}>
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
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1
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
