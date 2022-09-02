import {
   Dimensions,
   StyleSheet,
   Image,
   Pressable,
   ColorSchemeName,
   ImageBackground,
  FlatList,
  Alert,
  ActivityIndicator
  } from 'react-native';
import { Text, View, TextInput, Button} from '../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { Card } from 'react-native-paper';
import * as twine from '../api/twine';
import PressableImage from '../components/PressableImage';
import { TokenInvalidOwnerError } from '@solana/spl-token';

const SCREEN_DEEPLINK_ROUTE = "store_details";

const spacing = 10;
const width = (Dimensions.get('window').width) / 2;
const height = width;

export default function StoreDetailsScreen(props) {
  const [store, setStore] = useState<twine.Store>(props.route.params.store);
  const [products, setProducts] = useState<twine.Product[]>([]);
  const navigation = useRef(props.navigation).current;
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  
   useEffect(()=>{
    if(store.address) {
      setActivityIndicatorIsVisible(true);
      console.log('refreshing store...');
      twine
        .getStoreByAddress(store.address)
        .then(s=>{setStore(s);})
        .catch(err=>Alert.alert("error", err))
        .finally(()=>setActivityIndicatorIsVisible(false));
    }
   },[]);

   useEffect(()=>{
    if(store.address) {
      setActivityIndicatorIsVisible(true);
      console.log('refreshing store products...');
      twine
        .getProductsByStore(store.address, SCREEN_DEEPLINK_ROUTE)
        .then(products=>{
          setProducts(products);
        })
        .catch(err=>Alert.alert("error", err))
        .finally(()=>setActivityIndicatorIsVisible(false));
    }
  },[store.address]);
      
  function isAuthorizedToEditStore() {
    const pkey = twine.getCurrentWalletPublicKey();
    if(!pkey)
      return false;

    return pkey.equals(store?.authority) || pkey.equals(store?.secondaryAuthority);
  }

  const renderItem = ({ item }) => (  
    <View style={styles.row}>
      <View style={styles.card}>
        <PressableImage
          show={true}
          source={{uri:item?.data?.img}}
          onPress={() => navigation.navigate('ProductDetails',{store, product: item})}
          style={styles.itemImage} 
        /> 

        <Text style={styles.productCaption}>
          {item?.data?.displayName}
        </Text>
      </View>          
    </View>
  );

  
    return (    
      <View style={styles.container}>
        <ImageBackground 
          style={{width: '100%', height: '100%'}} 
          source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
          }}
        >  
          <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
          <View style={styles.header}>
            <Image source={{uri:store?.data?.img}} style={styles.headerImage}/>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>{store?.data?.displayName}</Text>            
            </View>
            
            { isAuthorizedToEditStore() &&   
              <>
              <Pressable
                onPress={() => navigation.navigate('CreateStore',{store})}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}>
                <FontAwesome5
                  name="edit"
                  size={25}
                  style={{ marginRight: 5 }}
                />
              </Pressable>  
              <Pressable
                onPress={() => navigation.navigate('CreateProduct',{store})}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}>
                <FontAwesome5
                  name="plus-circle"
                  size={25}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
              </>    
            }
            
          </View>    

          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.address.toBase58()}
            contentContainerStyle={styles.list}
            numColumns={2}
            columnWrapperStyle={styles.column}
          />

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
      flexDirection: 'row',
      backgroundColor: 'gray',
      height: '10%',
      width: '100%',
      marginBottom: 10,
    },
    headerTitle: {
      flexDirection: 'column',
      width: 250,
      backgroundColor: 'gray',
      flexWrap: 'wrap',
    },
    rowContainer: {
      /*flex: 1,
      alignItems: 'center',
      justifyContent: 'space-evenly',
      flexDirection: 'column',*/
    },
    row:{      
      flex: 1,
      //alignItems: 'center',
      justifyContent: 'space-evenly',   
      flexDirection: 'column',    
      flexShrink: 1,
      backgroundColor: 'rgba(52, 52, 52, 0)',
    },
    card:{
      backgroundColor: 'yellow',
      margin: 10,
      borderRadius: 4,
      shadowRadius: 2,
      justifyContent: 'space-around' 
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
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
        width: '95%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',        
    },
    headerImage:{
      width: '20%',
      height: '100%',
      borderRadius: 8,
      resizeMode: 'cover',
      alignSelf: 'flex-start',
    },
    list: {
      justifyContent: 'space-around',
      flexDirection: 'row'
    },
    column: {
      flexShrink: 1,
      flexDirection: 'column',
      width: width,
      height: height,
    },
    productCaption: {
      color: "#222",
      fontSize: 14,
      fontWeight: "bold",
      paddingLeft: 5,
      paddingTop: 3,
      margin: 5,
    },
  });
  