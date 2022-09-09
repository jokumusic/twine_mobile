import { StyleSheet, ImageBackground, Button, Alert, ScrollView } from 'react-native';
import { View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { useContext, useEffect, useRef, useState } from 'react';
import * as twine from '../api/twine';
import Navigation from '../navigation';
import { Tab, Text, TabView, ListItem, Avatar, Dialog  } from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';

const SCREEN_DEEPLINK_ROUTE = "stores";

export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  const twineContext = useContext(TwineContext);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [payToSells, setPayToSells] = useState<twine.Purchase[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);

  useEffect(()=>{
    refreshTab();
  },[
    tabIndex,
    twineContext.walletPubkey,
    twineContext.lastCreatedStore,
    twineContext.lastUpdatedStore,
    twineContext.lastCreatedProduct,
    twineContext.lastUpdatedProduct
  ]);

  async function refreshTab() {
    console.log('refreshtab');
    setShowLoadingDialog(true);
    
    switch(tabIndex) {
      case 0:
        await refreshStores();
        break;
      case 1: 
        await refreshProducts();
        break;
      case 2:
        await refreshPayToSells();
        break;
    }
    
    setShowLoadingDialog(false);
  }

  function walletIsConnected(msg){
    if(!twineContext.walletPubkey){
      Alert.alert(
        "connect to wallet",
        msg,
        [
          {text: 'Yes', onPress: () => navigation.navigate("ManageWallets")},
          {text: 'No', onPress: () => {}},
        ]);

        return false;
    }

    return true;
  }

  async function refreshPayToSells() {   
    if(!walletIsConnected("You must be connected to a wallet to view its sells.\nConnect to a wallet?"))
      return;    

    if(!twineContext.walletPubkey) {
      return;
    }

    console.log('refreshing payTo sells...')
    const purchases = await twineContext
      .getPurchasesByPayTo(twineContext.walletPubkey)
      .catch(err=>Alert.alert("Error", err));
    
    if(!purchases)
      return;

    purchases.sort((a,b)=> b?.purchaseTicket?.timestamp - a?.purchaseTicket?.timestamp);       
    setPayToSells(purchases);    
  }

  async function refreshProducts() {
    if(!walletIsConnected("You must be connected to a wallet to view its products.\nConnect to a wallet?"))
      return;    

    console.log('refreshing products...')
    twineContext
      .getProductsByAuthority(twineContext.walletPubkey, true)
      .then(items=>{            
        items.sort((a,b)=> a.name < b.name ? -1 : 1 );
        setProducts(items);
      })
      .catch(err=>Alert.alert("Error", err));
  }

  async function refreshStores() {    
    if(!walletIsConnected("You must be connected to a wallet to view its stores.\nConnect to a wallet?"))
      return;    

    console.log('refreshing stores...')
    twineContext
      .getStoresByAuthority(twineContext.walletPubkey)
      .then(items=>{
        const displayStores = items.sort((a,b)=>a.name < b.name ? -11 : 1);
        setStores(displayStores);
      })
      .catch(err=>Alert.alert("Error", err));
  }
  

  return (  
    <View style={styles.container}>   
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('../assets/images/screen_background.jpg')}>
          <Tab
            value={tabIndex}
            onChange={(e) => setTabIndex(e)}
            indicatorStyle={{
              backgroundColor: 'white',
              height: 3,
            }}
            variant="default"
          >
            <Tab.Item
              title="stores"
              titleStyle={{ fontSize: 12 }}
              icon={{ name: 'store', type: 'MaterialIcons', color: 'white' }}
            />
            <Tab.Item
              title="products"
              titleStyle={{ fontSize: 12 }}
              icon={{ name: 'widgets', type: 'MaterialIcons', color: 'white' }}
            />
            <Tab.Item
              title="sells"
              titleStyle={{ fontSize: 12 }}
              icon={{ name: 'attach-money', type: 'MaterialIcons', color: 'white' }}
            />
          </Tab>
          
          <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
            <TabView.Item style={{ width: '100%' }}>              
              <ScrollView style={{flex:1, width:'100%', backgroundColor: 'rgba(52, 52, 52, 0)'}}>
              { 
                stores.map((store, i) => (
                  <ListItem key={"store" + store.address?.toBase58()} bottomDivider onPress={()=>navigation.navigate('StoreDetails',{store})}>
                    <Avatar source={store?.data?.img && {uri: store.data.img}} size={70} />
                    <ListItem.Content >
                      <ListItem.Title>{store.data?.displayName}</ListItem.Title>
                      <ListItem.Subtitle>{store.data?.displayDescription}</ListItem.Subtitle>
                      <Text>Products: {store?.productCount.toString() ?? 0}</Text>
                    </ListItem.Content>
                  </ListItem>
                ))
              }
              </ScrollView>                                   
            </TabView.Item>
            <TabView.Item style={{ width: '100%' }}>
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
            </TabView.Item>
            <TabView.Item style={{ backgroundColor: 'rgba(52, 52, 52, 0)', width: '100%' }}>
              <ScrollView style={{flex:1, width:'100%', backgroundColor: 'rgba(52, 52, 52, 0)'}}>
              {
                payToSells.map((sell, i) => (
                  <ListItem key={"sell" + sell.purchaseTicket?.address?.toBase58()} bottomDivider>
                    <Avatar 
                      source={sell.productSnapshot?.data?.img && {uri: sell.productSnapshot.data.img}}
                      size={70}
                      onPress={()=>navigation.navigate('ProductDetails', {product:sell.productSnapshot})}
                    />
                    <ListItem.Content>
                      <ListItem.Title>{sell.productSnapshot?.data?.displayName}</ListItem.Title>
                      <View>
                        <Text>date: {new Date(sell.purchaseTicket?.timestamp?.toNumber() * 100).toLocaleString("en-us")}</Text>
                        <Text>price: ${sell.productSnapshot?.price}</Text>
                        <Text>quantity: {sell.purchaseTicket?.quantity?.toString()}</Text>
                        <Text>redemptions: {sell.purchaseTicket?.redeemed?.toString()}</Text>
                      </View>
                    </ListItem.Content>
                  </ListItem>
                ))
              }
              </ScrollView>
            </TabView.Item>
          </TabView>

          

      </ImageBackground>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header:{
    height: 45,
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(52, 52, 52, 0)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '90%',
  },
});


