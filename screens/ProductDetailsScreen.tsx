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
 import { PressableIcon, PressableImage } from '../components/Pressables';
 import CarouselCards from '../components/CarouselCards';
import { Button, Dialog, Icon, ListItem } from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';
import {Mint} from '../constants/Mints';
import QRCode from 'react-native-qrcode-svg';
import { PurchaseTicket, RedemptionType, Store, Product, Redemption, TicketTaker } from '../api/Twine';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { PublicKey } from '@solana/web3.js';

const SCREEN_DEEPLINK_ROUTE = "stores";

const {height, width} = Dimensions.get('window');
const WINDOW_HEIGHT = height;
const WINDOW_WIDTH = width;
const SLIDER_WIDTH = WINDOW_WIDTH;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH/2);


 export default function ProductDetailsScreen(props) {
   const [store, setStore] = useState<Store>(props.route.params?.store ?? {})
   const [product, setProduct] = useState<Product>(props.route.params.product);
   const [purchaseTicket, setPurchaseTicket] = useState<PurchaseTicket>(props.route.params?.purchaseTicket);
   const navigation = useRef(props.navigation).current;
   const { addItemToCart } = useContext(CartContext);
   const [showLoadingDialog, setShowLoadingDialog] = useState(false);
   const twineContext = useContext(TwineContext);
   const [redemptions, setRedemptions] = useState<Redemption[]>([]);
   const [showTicketTakerDialog, setShowTicketTakerDialog] = useState(false);
   const [showScannerDialog, setShowScannerDialog] = useState(false);
   const [scanned, setScanned] = useState(false);
   const [newTakerAddress, setNewTakerAddress] = useState("");
   const [takers, setTakers] = useState<TicketTaker[]>([]);
   const [currentTaker, setCurrentTaker] = useState<TicketTaker>();
   const [showValidateRedemptionScannerDialog, setShowValidateRedemptionScannerDialog] = useState(false);
   const [scannedRedemptionIsValid, setScannedRedemptionIsValid] = useState<boolean|null>(null);
   const [showValidateRedemptionResult, setShowValidateRedemptionResult] = useState(false);


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

   useEffect(()=>{
    if(!purchaseTicket)
      return;

    console.log('getting redemptions');
    setShowLoadingDialog(true);
    (async () => {
      const items = await twineContext
        .getRedemptionsByTicketAddress(purchaseTicket.address)
        .catch(console.log);
      
        setRedemptions(items);
        setShowLoadingDialog(false);
    })();    
   }, [purchaseTicket]);

   useEffect(()=>{
    if(!takers)
      return;

    console.log('checking if current viewer is a taker');
    
    (async () => {
      const taker = await twineContext
        .getProductTicketTakerAccount(product.address, twineContext.walletPubkey)
        .catch(console.log);
      if(taker) {
        setCurrentTaker(taker);
      }
    })();    
   }, [takers]);
      
  async function addToCart() {
    console.log('adding to cart');
      if(!product?.address){
        Alert.alert('Product is missing an address. Unable to add item to cart.')
      }
      addItemToCart(product.address);
  }

  function isAuthorizedToEditProduct() {
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

  async function initiateRedemption(){
    const redemption = await twineContext.initiateRedemption(purchaseTicket, 1, SCREEN_DEEPLINK_ROUTE);
    console.log('got redemption: ', redemption);
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

  useEffect(()=>{
    if(!showTicketTakerDialog)
      return;

    console.log('getting takers');
    setShowLoadingDialog(true);
    (async () => {
      const items = await twineContext
        .getRedemptionTakersByProductAddress(product.address)
        .catch(console.log);
      
        setTakers(items);
        setShowLoadingDialog(false);
    })();    
   }, [purchaseTicket]);


  async function addProductRedemptionTaker() {
    const taker = await twineContext
      .createProductRedemptionTaker(product.address, new PublicKey(newTakerAddress))
      .catch(console.log);
    
    setTakers(takers.concat(taker));
    console.log('taker: ', taker);
  }

  const onAddTicketTakerAddressScanned = ({ type, data }) => {
    setScannedRedemptionIsValid(false);
    setScanned(true);
    setNewTakerAddress(data);
    setShowScannerDialog(false);
    setShowTicketTakerDialog(true);
  };

  const onRedemptionScanned = async ({ type, data }) => {
    let redemption = await twineContext
      .getRedemptionByAddress(data)
      .catch(console.log);
  
    if(redemption && redemption?.closeTimestamp == 0) {
      console.log('processing redemption');
      redemption = await twineContext
        .takeRedemption(data, SCREEN_DEEPLINK_ROUTE)
        .catch(console.log);
    }

    if(redemption?.product && product.address.equals(redemption.product) && redemption.closeTimestamp > 0)
    {
      setScannedRedemptionIsValid(true);
    }
    else{
      setScannedRedemptionIsValid(false);
    }
  };

  return (         
    <View style={styles.container}>
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
         
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('../assets/images/screen_background.jpg')}>
        <View style={{margin: 10, backgroundColor: 'transparent', flexDirection: 'row'}}>
          { isAuthorizedToEditProduct() &&   
            <>
              <PressableIcon
                name="create-outline"
                size={30}
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('EditProduct',{store, product})}
              />
              <PressableIcon
                name="shield-checkmark-outline"
                size={30}
                style={{ marginRight: 15 }}
                onPress={() => setShowTicketTakerDialog(true)}
              />            
            </>
          }

          { currentTaker &&
            <PressableIcon
              name="checkmark-done-outline"
              size={30}
              style={{ marginRight: 15 }}
              onPress={() => setShowValidateRedemptionScannerDialog(true)}
            />
          }
        </View>
      
        {purchaseTicket && purchaseTicket.remainingQuantity > 0 &&
          <View style={{flexDirection: 'column', width: '100%', backgroundColor: 'transparent', justifyContent: 'space-around'}}>                   
              <Button 
                title="Reedeem"
                onPress={()=>initiateRedemption()}
                buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '95%', height: 50, alignSelf:'center', marginVertical: 10 }}
                disabled={purchaseTicket.remainingQuantity <= 0}
              />
          </View>
        }
       
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
          <Text>Available Quantity: {product.inventory.toString()}</Text> 
          {      
            product.data?.sku  &&
            <Text>Sku: {product.data?.sku}</Text>
          }
          <Text>
            Redemption Type: 
            {
              (product.redemptionType & RedemptionType.Immediate) == RedemptionType.Immediate ? "Immediate"
              : (product.redemptionType & RedemptionType.Ticket) == RedemptionType.Ticket ? "Ticket"
              : "Unknown"
            }
          </Text> 

          { product.isSnapshot ||
          <Button 
            title="Add To Cart"
            onPress={addToCart}
            buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '95%', height: 50, alignSelf:'center', marginVertical: 10 }}
            disabled={product.inventory < 1}
          />
          }

          {
            redemptions.map((redemption, i) => (
            <ListItem
                key={"redemption" + redemption.address?.toBase58()}
                bottomDivider
                containerStyle={{marginTop: 10, borderTopWidth: 1}}
            >
                <ListItem.Content >
                    <View style={{flexDirection: 'row'}}>              
                        <QRCode value={redemption.address?.toBase58()} size={60}/>
                        <View style={{marginLeft: 10}}>
                          <Text style={{fontSize:15}}>quantity: {redemption.redeemQuantity.toString()}</Text>
                          <Text style={{fontSize:15}}>initiated : {new Date(redemption.initTimestamp?.toNumber() * 1000).toLocaleString("en-us")}</Text>
                          { redemption.closeTimestamp > 0 &&
                            <Text style={{fontSize:15}}>closed : {new Date(redemption.closeTimestamp?.toNumber() * 1000).toLocaleString("en-us")}</Text>                                        
                          }
                        </View>
                    </View>
                </ListItem.Content>
            </ListItem>
            ))
          }  
        </ScrollView>
      </ImageBackground>

      <Dialog 
        isVisible={showTicketTakerDialog}
        onBackdropPress={()=>{setShowTicketTakerDialog(false);}}
      >
            <Dialog.Title title="Ticket Takers"/>
            <Text>
                Manage who can process ticket redemptions
            </Text>
         
            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>New Taker:</Text>
                <View style={{flexDirection: 'row'}}>
                  <TextInput
                      value={newTakerAddress}
                      placeholder="taker's public key"  
                      style={styles.inputBox}
                      onChangeText={(t)=>setNewTakerAddress(t)}
                  />
                  <Button
                    onPress={()=>{setShowTicketTakerDialog(false); setShowScannerDialog(true);}}
                    style={{borderRadius: 6, margin: 5,}}
                  >
                    <Icon type="ionicon" name="scan-outline" color="blue" size={22}/>
                  </Button>
                
                  <Button
                    onPress={()=>addProductRedemptionTaker()}
                    style={{borderRadius: 6, margin: 5,}}
                  >
                    <Icon type="ionicon" name="add" color="blue" size={22}/>
                  </Button>
                </View>
            </View>

            <ScrollView>
            {
              takers.map((taker, i) => (
                <ListItem
                    key={"productTaker" + taker.address?.toBase58()}
                    bottomDivider
                    containerStyle={{marginTop: 10, borderTopWidth: 1}}
                >
                    <ListItem.Content >
                        <View style={{flexDirection: 'row'}}>              
                            <QRCode value={taker.address?.toBase58()} size={40}/>
                            <View style={{marginLeft: 10}}>
                              <Text style={{fontSize:15}}>enabled: {new Date(taker.enabledTimestamp?.toNumber() * 1000).toLocaleString("en-us")}</Text>
                              { taker.disabledTimestamp > 0 &&
                                <Text style={{fontSize:15}}>disabled : {new Date(taker.disabledTimestamp.toNumber() * 1000).toLocaleString("en-us")}</Text>                                        
                              }
                            </View>
                        </View>
                    </ListItem.Content>
                </ListItem>
              ))              
          }
          </ScrollView>

           
        </Dialog>

        <Dialog
            isVisible={showScannerDialog}
            onBackdropPress={()=>{setShowScannerDialog(false); setShowTicketTakerDialog(true);}}
        >
          <View style={{width: WINDOW_WIDTH * 0.5, height: WINDOW_HEIGHT * 0.7, alignSelf: 'center'}}>              
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : onAddTicketTakerAddressScanned}
              style={StyleSheet.absoluteFill}
              />
          </View>  
        </Dialog>

        <Dialog
            isVisible={showValidateRedemptionScannerDialog}
            onBackdropPress={()=>{setShowValidateRedemptionScannerDialog(false);}}
        >
          <View style={{width: WINDOW_WIDTH * 0.5, height: WINDOW_HEIGHT * 0.7, alignSelf: 'center'}}>
            <BarCodeScanner
              onBarCodeScanned={(s)=>{
                setScannedRedemptionIsValid(null);
                setShowValidateRedemptionScannerDialog(false);
                setShowValidateRedemptionResult(true);
                onRedemptionScanned(s);
              }}
              style={StyleSheet.absoluteFill}
              />
          </View>          
        </Dialog>

        <Dialog
            isVisible={showValidateRedemptionResult}
            onBackdropPress={()=>{setShowValidateRedemptionResult(false); setShowValidateRedemptionScannerDialog(true);}}
        >
          {scannedRedemptionIsValid == null ? <Dialog.Loading />
           : scannedRedemptionIsValid === true ? <Icon type="ionicon" name="checkmark-circle-outline" color="green" size={70}/>
           : <Icon type="ionicon" name="remove-circle-outline" color="red" size={70}/>
          }         
        </Dialog>
        
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
    inputSection: {
      flex: 1,
      alignContent: 'flex-start',
      padding: 10,
      marginTop: 10,
      borderWidth: 2,
      backgroundColor: '#DDDDDD',
      width:'95%',
      alignSelf: 'center',
      borderRadius: 20,
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
    textBox: {
      borderWidth: 0,
      alignContent: 'flex-start',
      height: 40,
      marginBottom: 10,
    },
    inputRow:{
      margin: 5,
    },

   });
   