import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
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


  async function connectWallet(){
    twine.connectWallet(false, SCREEN_DEEPLINK_ROUTE)
    .then(()=>{
      log('connected to wallet');
    })
    .catch(err=> log(err));
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
      .updateProduct(product)
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
      <View style={styles.body}>
        
        <TextInput placeholder='Name'
          style={{margin: 5}}
          value={product.name}
          onChangeText={(t)=>setProduct({...product,  name: t})}
        />

        <TextInput placeholder='Description'
          style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}}        
          multiline={true}
          numberOfLines={4}
          value={product.description}
          onChangeText={(t)=>setProduct({...product,  description: t})}
        />

        <TextInput 
          placeholder='image url'
          value={product.img}
          onChangeText={(t)=>setProduct({...product, img: t})} 
        />
        
        <Text>lamports:</Text>
        <TextInput placeholder='cost in lamports'
          value={product.price}
          keyboardType='numeric'
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}}
          onChangeText={(t)=>setProduct({...product,  price: t})}
        />
        
        <TextInput
          placeholder='SKU#'
          value={product.sku}
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}} 
          onChangeText={(t)=>setProduct({...product,  sku: t})}/>
      </View>
      <View>
        <Button title='Read Product' onPress={readProduct} />
        <Button title='Update Product' onPress={updateProduct} />
      </View>

      
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
