import {
    Dimensions,
    StyleSheet,
    Image,
    Pressable,
    ColorSchemeName,
    ImageBackground,
   FlatList,
   ScrollView
   } from 'react-native';
 import { Text, View, TextInput, Button} from '../components/Themed';
 import { FontAwesome5 } from '@expo/vector-icons';
 import React, { useEffect, useRef, useState } from 'react';
 import Colors from '../constants/Colors';
 import useColorScheme from '../hooks/useColorScheme';

 export const WINDOW_WIDTH = Dimensions.get('window').width;


 export default function ProductDetailsScreen(props) {
   const [product, setProduct] = useState(props.route.params.product);
   const navigation = useRef(props.navigation).current;

    return (    
    <View style={styles.container}>
        <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={{uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg'}}>  
        <View style={styles.header}>        
            <Pressable
            onPress={() => navigation.navigate('EditProduct',{product})}
            style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
            })}>
            <FontAwesome5
                name="edit"
                size={25}
                style={{ marginRight: 15 }}
            />
            </Pressable> 
            <Text style={styles.title}>{product.name}</Text>
        </View>
        <View style={{backgroundColor: 'rgba(52, 52, 52, .025)'}}>
          <ScrollView horizontal={false}>
            <Image source={{uri:product.img}} style={styles.productImage}/>
            <Text>{product.description}</Text>
            <Text>Price: {product.price}</Text>
            <Text>Sku: {product.sku}</Text>
            <Button title="Add To Cart"/>
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
   