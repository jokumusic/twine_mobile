import {
   Dimensions,
   StyleSheet,
   Image,
   ImageBackground,
  Alert,
  ScrollView
  } from 'react-native';
import { View } from '../components/Themed';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { TwineContext } from '../components/TwineProvider';
import * as twine from '../api/Twine';
import {PressableIcon, PressableImage} from '../components/Pressables';
import { Text, ListItem, Avatar, Dialog  } from '@rneui/themed';

const SCREEN_DEEPLINK_ROUTE = "store_details";

const spacing = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StoreDetailsScreen(props) {
  const [store, setStore] = useState<twine.Store>(props.route.params.store);
  const [products, setProducts] = useState<twine.Product[]>([]);
  const navigation = useRef(props.navigation).current;
  const twineContext = useContext(TwineContext);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  
   useEffect(()=>{
    if(store.address) {
      console.log('refreshing store...');
      setShowLoadingDialog(false);
      twineContext
        .getStoreByAddress(store.address)
        .then(s=>{setStore(s);})
        .catch(err=>Alert.alert("error", err))
        .finally(()=>setShowLoadingDialog(false));
    }
   },[]);

   useEffect(()=>{
    if(store.address) {
      console.log('refreshing store products...');
      setShowLoadingDialog(false);

      twineContext
        .getProductsByStore(store.address)
        .then(products=>{
          setProducts(products);
        })
        .catch(err=>Alert.alert("error", err))
        .finally(()=>setShowLoadingDialog(false));
    }
  },[store.address,
     twineContext.lastUpdatedStore,
     twineContext.lastCreatedProduct,
     twineContext.lastUpdatedProduct,
  ]);
      
  function isAuthorizedToEditStore() {
    if(!twineContext.walletPubkey)
      return false;

    if(!store?.authority)
      return false;

    if(!store?.secondaryAuthority)
      return false;

    return twineContext.walletPubkey.equals(store.authority) || twineContext.walletPubkey.equals(store.secondaryAuthority);
  }


  
    return (    
      <View style={styles.container}>
        <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
          <Dialog.Loading />
        </Dialog>

        <ImageBackground 
          style={{width: '100%', height: '100%'}} 
          source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
          }}
        >  
          
          <View style={styles.header}>
            <Image source={{uri:store?.data?.img}} style={styles.headerImage}/>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>{store?.data?.displayName}</Text>            
            </View>
            <View style={styles.headerIcons}>
            <PressableIcon
              name="share-social-outline"
              size={30}
              style={{ margin: 5 }}
              onPress={() => Alert.alert('not implemented', 'Not Implemented.')}
            />

            { isAuthorizedToEditStore() &&   
              <>
              <PressableIcon
                name="create-outline"
                size={30}
                style={{ marginRight: 5 }}
                onPress={() => navigation.navigate('EditStore',{store})}
              />
              <PressableIcon
                name="add-circle-outline"
                size={30}
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('EditProduct',{store})}
                />      
              </>    
            }
            </View>
          </View>    
          
          <ScrollView style={{flex:1, width:'100%', backgroundColor: 'rgba(52, 52, 52, 0)'}}>
            {
              products.map((product, i) => (
                <ListItem key={"product" + product.address?.toBase58()} bottomDivider  onPress={()=>navigation.navigate('ProductDetails', {product})}>
                  <Avatar source={product?.data?.img && {uri: product.data.img}} size={70} />
                  <ListItem.Content>
                    <ListItem.Title>{product.data?.displayName}</ListItem.Title>
                    <ListItem.Subtitle>{product.data?.displayDescription}</ListItem.Subtitle>
                    <Text>Price: ${product.price}</Text>
                    <Text>Inventory: {product.inventory}</Text>
                  </ListItem.Content>
                </ListItem>
              ))
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
      flexDirection: 'row',
      backgroundColor: 'rgba(52, 52, 52, 0)',
      height: '11%',
      width: '100%',
      marginBottom: 0,
    },
    headerImage:{
      width: '25%',
      height: '100%',
      borderRadius: 4,
      resizeMode: 'contain',
      alignSelf: 'flex-start',
    },
    headerTitle: {
      flexDirection: 'column',
      backgroundColor: 'rgba(52, 52, 52, 0)',
      flexWrap: 'wrap',
      width: '48%',
      color: 'white',
    },
    headerIcons:{
      flexDirection: 'row',
      backgroundColor: 'rgba(52, 52, 52, 0)',
      width: '22%',
      alignSelf: 'flex-end',
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
      height: 250,
      width: 250,
    },
    card:{
      backgroundColor: 'yellow',
      margin: 10,
      borderRadius: 4,
      shadowRadius: 2,
      justifyContent: 'space-around',
      height: SCREEN_WIDTH /2.5,
    },
    cardFooter:{
      backgroundColor: '#77aaaa',
    },
    productCaption: {
      fontSize: 16,
      fontWeight: "bold",
      paddingLeft: 5,
      paddingTop: 3,
      margin: 5,
    },
    title: {
      fontSize: 21,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      color: '#FFFFFF',
      paddingLeft: 4,
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
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'contain',        
    },    
    list: {
      justifyContent: 'space-around',
      flexDirection: 'row'
    },
    column: {
      flexShrink: 1,
      flexDirection: 'column',
      width: SCREEN_WIDTH /2,
      //height: height,
    },
    
  });
  