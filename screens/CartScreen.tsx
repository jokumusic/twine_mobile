import { useState, useContext, useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Image, Pressable, StyleSheet, Text, TouchableNativeFeedback, View } from "react-native";
import { CartContext } from "../components/CartProvider";
import { TextInput } from "../components/Themed";
import * as twine from "../api/twine";
import { useFocusEffect } from "@react-navigation/native";

const SCREEN_DEEPLINK_ROUTE = "cart";

export default function CartScreen(props) {
    const navigation = useRef(props.navigation).current;
    const [products, setProducts] = useState([] as twine.Product[]);
    let [total, setTotal] = useState(0);
    const {map, itemCount, addItemToCart, removeItemFromCart, getItemsResolved} = useContext(CartContext);
    const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
    const [viewPurchasesVisible, setViewPurchasesVisible] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const walletPubkey = useRef(twine.getCurrentWalletPublicKey());

    useEffect(() =>{
        setActivityIndicatorIsVisible(true);
        console.log('refreshing product list');
        console.log('before: ', itemCount);
        getItemsResolved()
            .then(items=>{  
                console.log('after: ', itemCount);
                setProducts(items)
                setTotal(items.reduce((total,item)=>total + (item.count * item.price), 0));
            })
            .catch(err=>Alert.alert('error', err))
            .finally(()=>setActivityIndicatorIsVisible(false));

    },[itemCount]);

    useEffect(()=>{
       
        if(!viewPurchasesVisible)
            return;
            
        const currentWalletPubkey = twine.getCurrentWalletPublicKey();
        if(!currentWalletPubkey){
            Alert.alert(
            "connect to wallet",
            "You must be connected to a wallet to view the purchases associated with it.\nConnect to a wallet?",
            [
                {text: 'Yes', onPress: () => twine.connectWallet(true, SCREEN_DEEPLINK_ROUTE)},
                {text: 'No', onPress: () => {}},
            ]);
            return;
        } 
        else {       
            refreshPurchases();            
        }

    },[viewPurchasesVisible])

    useFocusEffect(()=>{
        const currentWalletPubkey = twine.getCurrentWalletPublicKey();
        if(walletPubkey.current != currentWalletPubkey) {

            walletPubkey.current = currentWalletPubkey;

            if(viewPurchasesVisible)
                refreshPurchases();
        }
    });

    async function refreshPurchases() {
        setActivityIndicatorIsVisible(true);        
        const currentWalletPubkey = twine.getCurrentWalletPublicKey();
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
/*
    async function setItemCount(item, count) {
        if(item.count > count)
            removeItemFromCart(item.address.toBase58(), item.count - count)
        else if(count > item.count)
            addItemToCart(item.address.toBase58(), count-item.count);
        //else the difference is 0, so leave the same
   }
*/
    function renderTotal() {        
        return (
            <View style={{marginBottom: 15}}>
                <View style={styles.cartLineTotal}>
                    <Text style={[styles.lineTotalLeft, styles.lineTotal]}>Total</Text>
                    <Text style={styles.lineTotalRight}>$ {total}</Text>
                </View>           
      
                <Button title="Checkout" onPress={checkOut}/>
            </View>
        );
    }

    function renderItem({item}) {

        return (
            <View key={item.address.toBase58()} style={styles.cartLine}>                    
                <Pressable
                    onPress={() => navigation.navigate('ProductDetails',{product:item})}
                    style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>
                    <Image source={{uri:item.data?.img}} style={styles.lineImage} />
                </Pressable>
                
                <View style={{flexDirection: 'column', width:'35%'}}>
                    <Text style={styles.lineLeft}>{item.name}</Text>                    
                    <Button title="delete" onPress={()=>removeItemFromCart(item.address)}/>                  
                </View>
                
                <View style={{flexDirection: 'column', width: '10%', paddingLeft: 30, alignContent:'center', justifyContent:'center'}}>

                <TextInput
                    style={{width: 40, height: 40, fontSize: 18, borderWidth:1, alignContent: 'center', justifyContent: 'center', backgroundColor:'#eeeeee'}}
                    value={item.count.toString()}
                    keyboardType='numeric'
                    editable={false}
                />
                </View>

                <Text style={styles.lineRight}>$ {item.price.toString()} </Text>
            </View>
        );
    }

    function renderPurchaseItem({item}) {
        if(item?.ticket && item?.snapshot) {
            const purchaseDate = new Date(item.ticket?.timestamp?.toNumber() *1000);
            return (
                <View key={item.ticket?.address?.toBase58()} style={{height: 200, width:'100%', borderBottomWidth: 2, flexDirection: 'row'}}>
                    <View style={{flexDirection:'column', width: '50%'}}>
                        <Text style={{fontSize:15}}>price: ${item.snapshot?.price}</Text>
                        <Text style={{fontSize:15}}>quantity: {item.ticket?.quantity?.toString()}</Text>
                        <Text style={{fontSize:15}}>redemptions: {item.ticket?.redeemed?.toString()}</Text>
                        <Text style={{fontSize:15}}>slot: {item.ticket?.slot?.toNumber()}</Text>
                        <Text style={{fontSize:15}}>date: {purchaseDate.toLocaleDateString("en-us")}</Text>
                        <Text style={{fontSize:15}}>time: {purchaseDate.toLocaleTimeString("en-us")}</Text>
                    </View>
                    <View style={{flexDirection:'column'}}>
                        <Image source={{uri:item.snapshot?.data?.img}}  style={{width: 150, height: 150}}/>
                    </View>
                </View>
            );
        } else{
            return (<></>);
        }
    }




    return ( 
        <>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button title="Pending Purchases" onPress={()=>setViewPurchasesVisible(false)}/>
            <Button title="Purchased" onPress={()=>setViewPurchasesVisible(true)}/>
        </View>

        {
            viewPurchasesVisible
            ? <FlatList
                style={styles.itemsList}
                contentContainerStyle={styles.itemsListContainer}
                data={purchases}
                renderItem={renderPurchaseItem}
                keyExtractor={(purchase) => purchase?.ticket?.address?.toBase58()}                
            />
            
            : <FlatList
                style={styles.itemsList}
                contentContainerStyle={styles.itemsListContainer}
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.address.toBase58()}
                ListHeaderComponent={renderTotal}
            />

        }

            <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
        </>
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
