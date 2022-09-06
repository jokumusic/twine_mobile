import { useState, useContext, useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import { CartContext } from "../components/CartProvider";
import { TextInput } from "../components/Themed";
import * as twine from "../api/twine";
import { useFocusEffect } from "@react-navigation/native";
import { Tab, Text, TabView, ListItem, Avatar, Button } from '@rneui/themed';

const SCREEN_DEEPLINK_ROUTE = "cart";

export default function CartScreen(props) {
    const navigation = useRef(props.navigation).current;
    const {map, itemCount, addItemToCart, removeItemFromCart, getItemsResolved} = useContext(CartContext);
    const [checkoutItems, setCheckoutItems] = useState([] as twine.Product[]);
    const [checkoutItemsTotal, setCheckoutItemsTotal] = useState(0);
    const [purchases, setPurchases] = useState([]);

    const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
    const [walletPubkey,setWalletPubkey] = useState(twine.getCurrentWalletPublicKey());
    const [tabIndex, setTabIndex] = useState(0);


    useEffect(()=> {
            refreshTab();
        },
        [tabIndex,walletPubkey,itemCount]
    );

    async function refreshTab() {
        switch(tabIndex) {
          case 0: refreshCheckout();
            break;
          case 1: refreshPurchases();
            break;
        }
    }

    function walletIsConnected(){
        const currentWalletPubkey = twine.getCurrentWalletPublicKey();
        if(!currentWalletPubkey){
            Alert.alert(
            "connect to wallet",
            "You must be connected to a wallet to view its stores.\nConnect to a wallet?",
            [
                {text: 'Yes', onPress: () => twine
                .connectWallet(true, SCREEN_DEEPLINK_ROUTE)
                .then(pubkey=>setWalletPubkey(pubkey))
                .catch(err=>Alert.alert('error', err))
                },
                {text: 'No', onPress: () => {}},
            ]);

            return false;
        }

        return true;
    }

    async function refreshCheckout() {
        if(!walletIsConnected())
            return;

        setActivityIndicatorIsVisible(true);

        console.log('refreshing checkout items...');
        getItemsResolved()
            .then(items=>{  
                setCheckoutItems(items)
                setCheckoutItemsTotal(items.reduce((total,item)=>total + (item.count * item.price), 0));
            })
            .catch(err=>Alert.alert('error', err))
            .finally(()=>setActivityIndicatorIsVisible(false));
    }

    async function refreshPurchases() {
        if(!walletIsConnected())
            return;

        setActivityIndicatorIsVisible(true);        
        const currentWalletPubkey = twine.getCurrentWalletPublicKey();

        console.log('refreshing purchased...')
        const tickets = await twine
            .getPurchaseTicketsByAuthority(currentWalletPubkey)
            .catch(err=>Alert.alert('error', err))
            .finally(()=>setActivityIndicatorIsVisible(false));
        
        if(!tickets)
            return;

        const refreshedPurchases = [];
        
        for(const ticket of tickets){            
            const snapshot = await twine
                .getProductByAddress(ticket.productSnapshot)
                .catch(err=>console.log(err));
            
            refreshedPurchases.push({ticket,snapshot});
        }

        refreshedPurchases.sort((a,b)=> b?.ticket?.timestamp - a?.ticket?.timestamp);
        setPurchases(refreshedPurchases);
        setActivityIndicatorIsVisible(false);        
    }

    async function checkOut(){
        const currentWalletPublicKey = twine.getCurrentWalletPublicKey();
        if(!currentWalletPublicKey) {
            Alert.alert('error', 'not connected to a wallet');
            return;
        }

        console.log('checking out');
        setActivityIndicatorIsVisible(true);
        const promises = [];

        for(const product of products) {
            const buyPromise = twine
                .buyProduct(product, product.count, SCREEN_DEEPLINK_ROUTE)
                .then(ticket=>{
                    removeItemFromCart(product.address, product.count);
                })
                .catch(err=>Alert.alert("error", err));

            promises.push(buyPromise);
        }

        Promise
            .all(promises)
            .catch(err=>Alert.alert('error', err))
            .finally(()=>{
                setActivityIndicatorIsVisible(false);
            });

        console.log('done');
    }

    function setItemCount(item, count) {
        console.log('setItemCount');
        if(item.count > count) {
            console.log('removing');
            removeItemFromCart(item.address, item.count - count)
        }
        else if(count > item.count) {
            console.log('adding');
            addItemToCart(item.address, count-item.count);
        }
        //else the difference is 0, so leave the same
   }

    return ( 
        <View style={styles.container}>   
        <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={{
                uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
            }}
        >  
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
                    title="Checkout"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'shopping-cart', type: 'MaterialIcons', color: 'white' }}
                />
                <Tab.Item
                    title="Purchased"
                    titleStyle={{ fontSize: 12 }}
                    icon={{ name: 'widgets', type: 'MaterialIcons', color: 'white' }}
                />
            </Tab>

            <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
                <TabView.Item style={{ width: '100%', height: '100%'}}>              
                    <View style={{flex:1, width:'100%', height: '100%'}}>                    
                        <View style={{marginBottom: 0}}>
                            <View style={styles.cartLineTotal}>
                                <Text style={[styles.lineTotalLeft, styles.lineTotal]}>Total</Text>
                                <Text style={styles.lineTotalRight}>$ {checkoutItemsTotal}</Text>
                            </View>           
                
                            <Button 
                                title="Checkout"
                                buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '95%', height: 50, alignSelf:'center' }}
                                onPress={checkOut}
                                disabled={checkoutItems.length < 1}
                            />
                        </View>
                        <ScrollView style={{flex:1, width:'100%', height: '100%'}}>
                        {
                            checkoutItems.map((item)=> (
                            <ListItem 
                                key={"checkoutitem" + item.address?.toBase58()}
                                bottomDivider
                                containerStyle={{backgroundColor: '#FFFFFF', shadowOpacity: .8, width: '98%', alignSelf:'center', borderRadius: 6, marginTop: 5,padding:5}}> 
                                <ListItem.Content style={{flexDirection: 'column', justifyContent: 'flex-start'}}>
                                    <View style={{flexDirection: 'row', width: '100%', height: 130,}}>
                                        <Avatar 
                                            size={130}
                                            avatarStyle={{resizeMode:'contain'}}
                                            source={item?.data?.img && {uri: item.data.img}}
                                            onPress={() => navigation.navigate('ProductDetails',{product:item})}                                        
                                        />
                                        <View style={{flexDirection: 'column', paddingLeft:5, width: '70%'}}>
                                            <ListItem.Title>{item.data?.displayName}</ListItem.Title>
                                            <Text>{item.data?.displayDescription}</Text>
                                            <Text style={{fontWeight: 'bold', fontSize: 17 }}>${item.price.toString()}</Text>
                                        </View>
                                    </View>                                       
                                   
                                    <View style={{flexDirection: 'row', width:'65%', alignContent:'flex-start', justifyContent: 'flex-start'}}>   
                                        <ListItem.Input
                                            inputContainerStyle={{width: '100%', marginRight: 10 }}                                            
                                            inputStyle={{width: '100%', borderTopWidth: 1, borderBottomWidth: 1, }}
                                            style={{width: '100%'}}
                                            value={item.count.toString()}
                                            keyboardType='numeric'
                                            disabled={true}
                                            disabledInputStyle={{backgroundColor: 'grey', width: '50%'}}
                                            leftIcon={{
                                                type: 'ionicons',
                                                name: item.count > 1 ? 'remove' : 'delete',
                                                onPress:()=>removeItemFromCart(item.address,1)
                                            }}
                                            leftIconContainerStyle={[
                                                {backgroundColor: '#CCCCCC', borderWidth: 1, borderTopLeftRadius: 8, borderBottomLeftRadius: 8},
                                                ({ pressed }) => ({opacity: pressed ? 0.5 : 1,})
                                            ]}            
                                            rightIcon={{
                                                type: 'ionicons',
                                                name: 'add',
                                                onPress:()=>addItemToCart(item.address,1)
                                            }}
                                            rightIconContainerStyle={{backgroundColor: '#CCCCCC', borderWidth: 1, borderTopRightRadius: 8, borderBottomRightRadius: 8}}
                                        />         
                                        <Button
                                        title="Delete"
                                        buttonStyle={{
                                            backgroundColor: 'rgba(90, 154, 230, 1)',
                                            borderColor: 'transparent',
                                            borderWidth: 0,
                                            borderRadius: 8,
                                        }}
                                        containerStyle={{
                                            width: 100,
                                            marginHorizontal: 10
                                        }}
                                        onPress={()=>removeItemFromCart(item.address, true)}
                                        />                        
                                                       
                                    </View>                                   
                            
                                </ListItem.Content>
                            </ListItem>
                            ))
                        }
                        </ScrollView>       
                    </View>                                   
                </TabView.Item>
                <TabView.Item style={{ width: '100%' }}>              
                    <ScrollView style={{flex:1, width:'100%', backgroundColor: 'rgba(52, 52, 52, 0)'}}>
                    {
                        purchases.map((purchase, i) => (
                        <ListItem key={"purchase" + purchase.ticket?.address?.toBase58()} bottomDivider onPress={()=>navigation.navigate('ProductDetails',{product:purchase.snapshot})}>
                            <Avatar source={purchase?.snapshot?.data?.img && {uri: purchase.snapshot?.data.img}} size={70} />
                            <ListItem.Content >
                                <ListItem.Title>{purchase?.snapshot?.data?.displayName}</ListItem.Title>
                                <ListItem.Subtitle>{purchase?.snapshot?.data?.displayDescription}</ListItem.Subtitle>
                                <View>
                                    <Text style={{fontSize:15}}>price: ${purchase?.snapshot?.price}</Text>
                                    <Text style={{fontSize:15}}>quantity: {purchase.ticket?.quantity?.toString()}</Text>
                                    <Text style={{fontSize:15}}>redemptions: {purchase.ticket?.redeemed?.toString()}</Text>
                                    <Text style={{fontSize:15}}>slot: {purchase.ticket?.slot?.toNumber()}</Text>
                                    <Text style={{fontSize:15}}>date: {new Date(purchase.ticket?.timestamp?.toNumber() * 100).toLocaleString("en-us")}</Text>                                    
                                </View>
                            </ListItem.Content>
                        </ListItem>
                        ))
                    }
                    </ScrollView>                                   
                </TabView.Item>
            </TabView>

            <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
        </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    cartLine: { 
      flexDirection: 'row',
    },
    cartLineTotal: { 
      flexDirection: 'row',
      borderTopColor: '#dddddd',
      borderTopWidth: 1
    },
    lineTotal: {
      fontWeight: 'bold',    
    },
    lineTotalLeft: {
        flex:1,
        fontSize: 17, 
        lineHeight: 50, 
        color:'#333333',
        flexWrap: 'wrap',
        width: '90%'
    },
    lineTotalRight: {
        flex: 1,
        fontSize: 17, 
        fontWeight: 'bold',
        lineHeight: 50, 
        color:'#333333', 
        textAlign:'right',
    },
    lineLeft: {
      flex:1,
      fontSize: 17, 
      lineHeight: 22, 
      color:'#333333',
      flexWrap: 'wrap',
      width: '90%'
    },
    lineMiddle: {
      marginLeft: 15,
      fontSize: 16, 
      lineHeight: 50, 
      color:'#333333' ,
    },
    lineRight: { 
      flex: 1,
      fontSize: 17, 
      fontWeight: 'bold',
      lineHeight: 50, 
      color:'#333333', 
      textAlign:'right',
    },
    lineImage:{
        width: 75,
        height: 75,
        borderRadius: 10,
        margin: 8,
    },
    itemsList: {
      backgroundColor: '#eeeeee',
    },
    itemsListContainer: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 8,
      marginHorizontal: 8,
    },
  });
