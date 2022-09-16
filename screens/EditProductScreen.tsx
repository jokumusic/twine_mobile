import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput } from '../components/Themed';
import RadioGroup from 'react-native-radio-buttons-group';
import { PublicKey } from '@solana/web3.js';
import CarouselCards from '../components/CarouselCards';
import { PressableIcon, PressableImage } from '../components/Pressables';
import { CheckBox, Dialog, Icon, Button } from "@rneui/themed";
import { TwineContext } from '../components/TwineProvider';
import * as twine from '../api/Twine';
import { web3 } from '../dist/browser';


const SCREEN_DEEPLINK_ROUTE = "edit_product";

const SLIDER_WIDTH = Dimensions.get('window').width + 80
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * .4)
const ITEM_HEIGHT = Math.round(ITEM_WIDTH * .4);


export default function EditProductScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const twineContext = useContext(TwineContext);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [product, setProduct] = useState<twine.Product>(props.route.params?.product ?? {store: store?.address});
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [productPrice, setProductPrice] = useState(props.route.params?.product?.price ?? 0);
  const [productStatusChoices, setProductStatusChoices] = useState(
    Object
    .values(twine.ProductStatus)
    .filter(v=> !isNaN(Number(v)))
    .map(v => ({id:v , label: twine.ProductStatus[v], value: Number(v), selected: product?.status == v}))
  );

  const [pricingChoices, setPricingChoices] = useState(
    Object
    .values(twine.PricingStrategy)
    .filter(v=> !isNaN(Number(v)))
    .map(v => ({id:v , label: twine.PricingStrategy[v], value: Number(v), selected: product?.pricingStrategy == v}))
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

    if(product.redemptionType < 1) {
      Alert.alert('Error', 'Accept Exchange Type is required');
      return false;
    }

    if(product?.data?.images?.length < 1 ){
      Alert.alert("Error", 'An image is required.');
      return false;
    }

    if(!product?.data?.img){
      Alert.alert("Error", 'Thumbnail image is required. Select one of the images to be the thumbnail.');
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

    console.log('productPrice: ',  productPrice);
    if(productPrice < 0){
      Alert.alert("Error", 'Price must be greater than or equal to 0');
      return false;
    } else{
      validatedProduct = {...validatedProduct, price: productPrice};
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

    setShowLoadingDialog(true);
    log('creating product...');
    
    const createdProduct= await twineContext
      .createProduct(validatedProduct as twine.WriteableProduct, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>Alert.alert("error", err));

      if(createdProduct) {
        setProduct(createdProduct);
        log(JSON.stringify(createdProduct));
      } else {
        log('no product was returned');
      }

    setShowLoadingDialog(false);
    log('done');
  }

  const refreshProduct = async () => {
    setShowLoadingDialog(true);
    console.log('reading product...');

    const refreshedProduct = await twineContext
      .getProductByAddress(product?.address, SCREEN_DEEPLINK_ROUTE)
      .catch(log);

    if(refreshedProduct) {
      setProduct(refreshedProduct);
      setProductPrice(refreshedProduct.price);
      log(JSON.stringify(refreshedProduct));
    }
    else {
      log("no product was returned");
    }

    setShowLoadingDialog(false);
    log('done');
  }

  const updateProduct = async()=>{
    const validatedProduct = validateInputs();
    if(!validatedProduct)
      return;

    console.log("validated: ", validatedProduct);

    setShowLoadingDialog(true);
    log('updating product data...');
    
    const updatedProduct = await twineContext
      .updateProduct(validatedProduct, SCREEN_DEEPLINK_ROUTE)
      .catch(log);

    if(updatedProduct) {
      setProduct(updatedProduct);
      log(JSON.stringify(updatedProduct));
    }
    else {
      log("a product wasn't returned")
    }
    
    setShowLoadingDialog(false);
    log('done');
  }

  function carouselRenderImage({ item, index}) {
    const borderColor = product?.data?.img == item ? 'lime' : 'black'
    return (
      <>
        <PressableImage
          show={true}
          source={item && {uri: item}}
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
       <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>

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
          <Text style={styles.inputLabel}>Accepted Exchanges</Text>
          <View style={{flexDirection:'row', alignContent:'flex-start', justifyContent: 'flex-start'}}>
            <CheckBox
              title="Immediate"
              textStyle={{marginRight:0, paddingRight:0}}
              iconStyle={{marginRight:0,}}
              checked={product.redemptionType & twine.RedemptionType.Immediate}
              onPress={()=>setProduct({...product, redemptionType: product.redemptionType ^ twine.RedemptionType.Immediate})}
            />
            <CheckBox
              title="Ticket"
              checked={product.redemptionType & twine.RedemptionType.Ticket}
              onPress={()=>setProduct({...product, redemptionType: product.redemptionType ^ twine.RedemptionType.Ticket})}
            />
            <CheckBox
              title="Confirm"
              checked={product.redemptionType & twine.RedemptionType.Confirmation}
              onPress={()=>setProduct({...product, redemptionType: product.redemptionType ^ twine.RedemptionType.Confirmation})}
            /> 
          </View>
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

          {
            product?.data?.images &&
            <CarouselCards
                data={product?.data?.images}
                renderItem={carouselRenderImage}
                sliderWidth={SLIDER_WIDTH}
                itemWidth={100}
            />
          }
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
            placeholder='price $USD'
            style={styles.inputBox}
            value={productPrice.toString()}
            //keyboardType='decimal-pad'
            //autoCapitalize={'words'}
            keyboardType='numeric'
            onChangeText={(t)=> setProductPrice(t)}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            placeholder='how many are available?'
            style={styles.inputBox}
            value={product?.inventory?.toString()}
            keyboardType='numeric'
            onChangeText={(t)=>setProduct({...product,  inventory: Number(t)})}
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
          <Button 
          type="solid"         
          buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}          
          onPress={product?.address ? updateProduct : createProduct}
          >
            {product?.address ? 'Update' : 'Create'} 
          </Button>        
          <Button
            onPress={refreshProduct}
            type="solid"         
            buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
          >
            Refresh
          </Button>               
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
  },
  inputRow:{
    margin: 5,
  }
});