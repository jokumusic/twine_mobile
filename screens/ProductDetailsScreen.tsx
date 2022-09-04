import {
    Dimensions,
    StyleSheet,
    Image,
    Pressable,
    ColorSchemeName,
    ImageBackground,
   FlatList,
   ScrollView,
   SafeAreaView,
   Alert,
   ActivityIndicator
   } from 'react-native';
 import { Text, View, TextInput, Button} from '../components/Themed';
 import { FontAwesome5 } from '@expo/vector-icons';
 import React, { useEffect, useRef, useState, useContext } from 'react';
 import Colors from '../constants/Colors';
 import useColorScheme from '../hooks/useColorScheme';
 import { CartContext } from '../components/CartProvider';
 import * as twine from '../api/twine';
 import { PressableIcon, PressableImage } from '../components/Pressables';
 import CarouselCards from '../components/CarouselCards';
 

 const SCREEN_DEEPLINK_ROUTE = "stores";

 const WINDOW_WIDTH = Dimensions.get('window').width;
 const SLIDER_WIDTH = WINDOW_WIDTH;
 const ITEM_WIDTH = Math.round(SLIDER_WIDTH * .70);


 export default function ProductDetailsScreen(props) {
   const [store, setStore] = useState<twine.Store>(props.route.params?.store ?? {})
   const [product, setProduct] = useState<twine.Product>(props.route.params.product);
   const navigation = useRef(props.navigation).current;
   const { addItemToCart } = useContext(CartContext);
   const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);

   useEffect(()=>{
      setActivityIndicatorIsVisible(true);
      console.log('refreshing product...');
      twine
        .getProductByAddress(product.address)
        .then(p=>{setProduct(p);})
        .catch(err=>Alert.alert("error", err))
        .finally(()=>setActivityIndicatorIsVisible(false));
   },[]);
      
  async function addToCart() {  
      addItemToCart(product.address);
  }

  function isAuthorizedToEditStore() {
    const pkey = twine.getCurrentWalletPublicKey();
    if(!pkey)
      return false;

    return pkey.equals(product?.authority) || pkey.equals(product?.secondaryAuthority);
  }

  function carouselRenderImage({ item, index}) {
    return (
      item ?
        <PressableImage
          show={true}
          source={{uri: item}}
          style={{height:'100%', resizeMode:'stretch', aspectRatio: 1.2}}
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
      <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={{uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg'}}>
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
          <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>         
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
          <Text>Available Quantity: {product.inventory.toString()}</Text> 
          {      
            product.data?.sku  &&
            <Text>Sku: {product.data?.sku}</Text>
          }

          <Button title="Add To Cart" onPress={addToCart}/>
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
      width: WINDOW_WIDTH/2,
      height: '100%',
    },

   });
   