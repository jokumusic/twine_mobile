import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, ScrollView, StyleSheet } from 'react-native';
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
import { Twine } from '../target/types/twine';
import CarouselCards from '../components/CarouselCards';
import { PressableIcon, PressableImage } from '../components/Pressables';


const SCREEN_DEEPLINK_ROUTE = "edit_product";

const SLIDER_WIDTH = Dimensions.get('window').width + 80
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * .4)
const ITEM_HEIGHT = Math.round(ITEM_WIDTH * .4);


export default function EditProductScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [product, setProduct] = useState<twine.Product>(props.route.params?.product ?? {store: store?.address});
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [redemptionTypeChoices, setRedemptionTypeChoices] = useState(
    Object
      .values(twine.RedemptionType)
      .filter(v=> !isNaN(Number(v)))
      .map(v => ({id:v , label: twine.RedemptionType[v], value: Number(v), selected: product?.redemptionType == v}))
  );
  const [productStatusChoices, setProductStatusChoices] = useState(
    Object
    .values(twine.ProductStatus)
    .filter(v=> !isNaN(Number(v)))
    .map(v => ({id:v , label: twine.ProductStatus[v], value: Number(v), selected: product?.status == v}))
  );
  const [secondaryAuthority, setSecondaryAuthority] = useState(product?.secondaryAuthority?.toBase58() ?? "");
  const [payTo, setPayTo] = useState(product?.payTo?.toBase58() ?? "");
  const [addImageUrl, setAddImageUrl] = useState("");


  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);


  //validates inputs and sets them in the product object if needed
  function validateInputs() {
    console.log("product is: ", product);
    let validatedProduct = {...product};
    if(!product?.data?.displayName) {
      Alert.alert('Error', 'Name is required');
      return false;
    }

    if(!product?.data?.displayDescription){
      Alert.alert("Error", 'Description is required');
      return false;
    }

    const selectedRedemptionType = redemptionTypeChoices.find(t=>t.selected == true);
    console.log('selected: ', selectedRedemptionType);
    if(!selectedRedemptionType) {
      Alert.alert('Error', 'Redemption Type is required');
      return false;
    } 
    else {
      validatedProduct = {...validatedProduct, redemptionType: selectedRedemptionType.value};
      //console.log(tempProduct);
    }

    if(!product?.data?.img){
      Alert.alert("Error", 'Image is required');
      return false;
    }

    const selectedProductStatus = productStatusChoices.find(t=>t.selected == true);
    if(!selectedProductStatus) {
      Alert.alert('Error', 'Status is required');
      return false;
    } 
    else {
      validatedProduct = {...validatedProduct, status: selectedProductStatus.value};
    }

    if(product?.price < 0){
      Alert.alert("Error", 'Price must be greater than or equal to 0');
      return false;
    }

    if(product?.inventory < 1){
      Alert.alert("Error", 'Quantity must be greater than 0');
      return false;
    }
    
    if(payTo !== "") {
      try {
        const a = new PublicKey(payTo);
        validatedProduct = {...validatedProduct, payTo: a};
      }catch(err){
        Alert.alert("Error", 'Send Payment To address is invalid');
        return false;
      }
    }

    if(secondaryAuthority !== ""){
      try{
        const a = new PublicKey(secondaryAuthority);
        validatedProduct = {...validatedProduct, secondaryAuthority: a};
      }catch(err) {
        Alert.alert('error', 'Secondary Authority address is invalid');
        return false;
      }
    }

    log('all inputs look good!');

    return validatedProduct;
  }


  async function createProduct() {
    const validatedProduct = validateInputs();
    if(!validatedProduct)
      return;

    setActivityIndicatorIsVisible(true);
    log('creating product...');
    
    const createdProduct= await twine
      .createProduct(validatedProduct as twine.WriteableProduct, SCREEN_DEEPLINK_ROUTE)
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
    const validatedProduct = validateInputs();
    if(!validatedProduct)
      return;

    console.log("validated: ", validatedProduct);

    setActivityIndicatorIsVisible(true);
    log('updating product data...');
    
    const updatedProduct = await twine
      .updateProduct(validatedProduct, SCREEN_DEEPLINK_ROUTE)
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

  function carouselRenderImage({ item, index}) {
    const borderColor = product?.data?.img == item ? 'lime' : 'black'
    return (
      <>
        <PressableImage
          show={true}
          source={{uri: item}}
          style={{width:100, height:100, borderWidth:4, borderColor}}
          onPress={()=>
            setProduct({...product, data:{...product.data, img: item}})
          }
        />
        <PressableIcon
          name="remove-circle"
          color="red"
          onPress={()=>{
            let img = product?.data?.img;
            if(img == item)
              img = "";

            const images = product?.data?.images?.filter(i=>i!=item);
            setProduct({...product, data:{...product.data, img, images}});
          }}
        />
      </>
    );
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
            value={product?.data?.displayName}
            onChangeText={(t)=>setProduct({...product,  data:{...product?.data, displayName: t}})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput 
            placeholder='description of the product'
            style={styles.inputBox}       
            multiline={true}
            numberOfLines={4}
            value={product?.data?.displayDescription}
            onChangeText={(t)=>setProduct({...product,  data:{...product?.data, displayDescription: t}})}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Redemption Type</Text>
          <RadioGroup 
              radioButtons={redemptionTypeChoices} 
              onPress={setRedemptionTypeChoices} 
              containerStyle={{flexDirection: 'row', justifyContent: 'flex-start'}}
          />
        </View>        

        <View style={styles.inputRow}>
          <View style={{flexDirection: 'row'}}>            
            <TextInput
              placeholder='additional image url'
              style={[styles.inputBox,{marginRight:2, width:'92%'}]}
              value={addImageUrl}
              onChangeText={setAddImageUrl}
            />

            <PressableIcon
              name="add-circle"
              size={30}
              color="green"
              onPress={()=>{
                const images = product.data.images ?? [];
                images.push(addImageUrl);
                setProduct({...product, data:{...product.data, images}});
                setAddImageUrl("");
              }}
            />
          </View>

          <CarouselCards
              data={product?.data?.images}
              renderItem={carouselRenderImage}
              sliderWidth={SLIDER_WIDTH}
              itemWidth={100}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Status</Text>
          <RadioGroup 
              radioButtons={productStatusChoices} 
              onPress={setProductStatusChoices} 
              containerStyle={{flexDirection: 'row', justifyContent: 'flex-start'}}
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
          <Button title={product?.address ? 'Update' : 'Create'} onPress={product?.address ? updateProduct : createProduct} />        
          <Button title='Refresh' onPress={refreshProduct} />               
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