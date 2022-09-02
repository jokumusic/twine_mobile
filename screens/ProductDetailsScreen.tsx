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
   Alert
   } from 'react-native';
 import { Text, View, TextInput, Button} from '../components/Themed';
 import { FontAwesome5 } from '@expo/vector-icons';
 import React, { useEffect, useRef, useState, useContext } from 'react';
 import Colors from '../constants/Colors';
 import useColorScheme from '../hooks/useColorScheme';
 import { CartContext } from '../components/CartProvider';
 import * as twine from '../api/twine';
 import { PressableIcon } from '../components/Pressables';
 

 const SCREEN_DEEPLINK_ROUTE = "stores";

 export const WINDOW_WIDTH = Dimensions.get('window').width;


 export default function ProductDetailsScreen(props) {
   const [product, setProduct] = useState<twine.Product>(props.route.params.product);
   const navigation = useRef(props.navigation).current;
   const { addItemToCart } = useContext(CartContext);

      
   async function addToCart(){
      addItemToCart(product.address);
   }

   

    return (  
      
    <View style={styles.container}>
        <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={{uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg'}}>  
        <View style={styles.header}>        
            <PressableIcon
              name="create"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('EditProduct',{product})}
            />
            <Text style={styles.title}>{product.name}</Text>
        </View>
        <View style={{backgroundColor: 'rgba(52, 52, 52, .025)'}}>          
          <ScrollView horizontal={false}>          
            <Image source={{uri:product.data?.img}} style={styles.productImage}/>
            <Text>{product.description}</Text>
            <Text>Price: {product.price.toString()}</Text>
            <Text>Available Quantity: {product.inventory?.toString()}</Text>         
            <Text>Sku: {product.data?.sku}</Text>              
            <Button title="Add To Cart" onPress={addToCart}/>
          </ScrollView>
        </View>
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
       flexDirection: 'row-reverse',
       backgroundColor: '#5DBF9B',
       height: '5%',
       marginBottom: 10,
       alignContent: 'center',
       justifyContent: 'space-between'
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
     body: {
       //flex: 1,
       //alignItems: 'center',
       //justifyContent: 'top'
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
      productImage: {
        width: WINDOW_WIDTH /2,
        height: WINDOW_WIDTH /2
      }
   });
   