import {
    Dimensions,
    StyleSheet,
    ImageBackground,
   ScrollView,
   Alert,
   ActivityIndicator
   } from 'react-native';
 import { Text, View, TextInput} from '../components/Themed';
 import React, { useEffect, useRef, useState, useContext } from 'react';
 import { CartContext } from '../components/CartProvider';
 //import * as twine from '../api/twine';
 import { PressableIcon, PressableImage } from '../components/Pressables';
 import CarouselCards from '../components/CarouselCards';
import { Button, Dialog } from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';
import {Mint} from '../constants/Mints';

 const SCREEN_DEEPLINK_ROUTE = "stores";

 const WINDOW_WIDTH = Dimensions.get('window').width;
 const SLIDER_WIDTH = WINDOW_WIDTH;
 const ITEM_WIDTH = Math.round(SLIDER_WIDTH/2);


 export default function ProductDetailsScreen(props) {
   const [store, setStore] = useState<twine.Store>(props.route.params?.store ?? {})
   const [product, setProduct] = useState<twine.Product>(props.route.params.product);
   const navigation = useRef(props.navigation).current;
   const { addItemToCart } = useContext(CartContext);
   const [showLoadingDialog, setShowLoadingDialog] = useState(false);
   const twineContext = useContext(TwineContext);
   const [solPrice, setSolPrice] = useState(0);


   useEffect(()=>{
    (async ()=> {
      const result = await twineContext.tokenSwapper.getInQuote(Mint.USDC, product.price, 1, Mint.SOL);
      setSolPrice((Math.ceil(result.amount * 100) / 100).toFixed(2));
    })();

   },[product?.price]);

   useEffect(()=>{
      if(!product?.address) {
        Alert.alert("Product is missing an address. Unable to retrieve product information");
        return;
      }

      setShowLoadingDialog(false);
      console.log('refreshing product...');
      twineContext
        .getProductByAddress(product.address)
        .then(p=>{
          setProduct(p);
          setShowLoadingDialog(false);
        })
        .catch(err=>Alert.alert("error", err))
        .finally(()=>{setShowLoadingDialog(false);});
   },[twineContext.lastUpdatedProduct]);
      
  async function addToCart() {
    console.log('adding to cart');
      if(!product?.address){
        Alert.alert('Product is missing an address. Unable to add item to cart.')
      }
      addItemToCart(product.address);
  }

  function isAuthorizedToEditStore() {
    if(!twineContext.walletPubkey)
      return false;
      
    if(product.isSnapshot)
      return false;

    if(!product.authority)
      return false;
    
    if(!product.secondaryAuthority)
      return false;
    
    return twineContext.walletPubkey.equals(product.authority) || twineContext.walletPubkey.equals(product.secondaryAuthority);
  }

  function carouselRenderImage({ item, index}) {
    return (
      item ?
        <PressableImage
          show={true}
          source={item && {uri: item}}
          style={{height:'100%', resizeMode:'stretch', aspectRatio: 1}}
          onPress={()=>
            console.log('image pressed')
          }
        />
      :
      <></>
    );
  }

  return (         
    <View style={styles.container}>
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
         
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('../assets/images/screen_background.jpg')}>
        <View style={{margin: 10, backgroundColor: 'rgba(52, 52, 52, .025)'}}>
          { isAuthorizedToEditStore() &&    
            <PressableIcon
              name="create"
              size={30}
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('EditProduct',{store, product})}
            />
          }
        </View>  
       
        <View style={styles.imagesContainer}>
          { product?.data?.images &&
            <CarouselCards
              data={product?.data?.images}
              renderItem={carouselRenderImage}
              sliderWidth={SLIDER_WIDTH}
              itemWidth={ITEM_WIDTH}
            />
          }        
        </View>
        <ScrollView style={{marginTop: 10}}>
          <PressableIcon
            name="share-social"
            size={30}
            style={{ marginRight: 5 }}
            onPress={() => Alert.alert('not implemented', 'Not Implemented.')}
          />
                     
          <Text style={styles.title}>{product?.data?.displayName}</Text>
          <Text>{product?.data?.displayDescription}</Text>
          <Text>Price: $ {product.price.toString()}</Text>
          <Text>SOL: {solPrice}</Text>
          <Text>Available Quantity: {product.inventory.toString()}</Text> 
          {      
            product.data?.sku  &&
            <Text>Sku: {product.data?.sku}</Text>
          }

          { product.isSnapshot ||
          <Button 
            title="Add To Cart"
            onPress={addToCart}
            buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '95%', height: 50, alignSelf:'center' }}
            disabled={product.inventory < 1}
          />
          }
        </ScrollView>
      </ImageBackground>
    </View>
    );
      
 }
 
 const styles = StyleSheet.create({
     container:{
       backgroundColor: 'gray',
       height: '100%'      
     },
     header: {
       alignItems: 'center',
       flexDirection: 'column',
       backgroundColor: 'rgba(52, 52, 52, .025)',
       height: '25%',
       marginBottom: 5,
     },
     body: {
      flexDirection: 'column',
     },
     rowContainer: {
       /*flex: 1,
       alignItems: 'center',
       justifyContent: 'space-evenly',
       flexDirection: 'column',*/
     },
     row:{       
       flex: 1,
       alignItems: 'center',
       justifyContent: 'space-evenly',   
       flexDirection: 'column',       
       backgroundColor: 'yellow',
       margin: 10,
       flexShrink: 1,
     },
     title: {
       fontSize: 20,
       fontWeight: 'bold',
     },
     separator: {
       marginVertical: 30,
       height: 1,
       width: '90%',
     },
     itemImage: {
         width: '20%',
         height: '100%',
         borderRadius: 8,
         resizeMode: 'cover',
      },
    imagesContainer: {
      backgroundColor: 'rgba(52, 52, 52, .025)',
      height: '32%',
      width: '100%',
      marginTop: 5,
      marginBottom: 10,
    },
    productImage: {
      //width: WINDOW_WIDTH /2,
      //height: WINDOW_WIDTH /2
      width: '35%',//WINDOW_WIDTH/2,
      height: '100%',
    },

   });
   