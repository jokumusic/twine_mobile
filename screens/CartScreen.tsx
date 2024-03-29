import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Alert, ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { CartContext } from "../components/CartProvider";
import { Tab, Text, TabView, ListItem, Avatar, Button, Dialog } from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';
import {Mint} from '../constants/Mints';
import {Product, Purchase, PurchaseTicket} from '../api/Twine';

const SCREEN_DEEPLINK_ROUTE = "cart";

export default function CartScreen(props) {
    const navigation = useRef(props.navigation).current;
    const twineContext = useContext(TwineContext);
    const {map, itemCount, addItemToCart, removeItemFromCart, getItemsResolved} = useContext(CartContext);
    const [checkoutItems, setCheckoutItems] = useState([] as Product[]);
    const [checkoutItemsTotal, setCheckoutItemsTotal] = useState(0);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [showLoadingDialog, setShowLoadingDialog] = useState(false);
    const [initialized, setInitialized] = useState(false);


    useEffect(()=> {
        if(!initialized)
            setInitialized(true);

        refreshTab();
    }, [tabIndex,twineContext.walletPubkey]);

    useEffect(()=>{
        if(!initialized)
            return;

        refreshCheckout();
    }, [itemCount])

    async function refreshTab() {
        setShowLoadingDialog(true);

        switch(tabIndex) {
          case 0: 
            await refreshCheckout();
            break;
          case 1: 
            await refreshPurchases();
            break;
        }

        setShowLoadingDialog(false);    
    }

    function walletIsConnected(msg){
        if(!twineContext.walletPubkey){
          Alert.alert(
            "connect to wallet",
            msg, //"wallet name: " + twineContext.getCurrentWalletName() + "\nAddress: " + twineContext.walletPubkey?.toBase58(),
            [
              {text: 'Yes', onPress: () =>
                    twineContext.getCurrentWalletName() == "Phantom"
                    ? twineContext.connectWallet(true, SCREEN_DEEPLINK_ROUTE).catch(err=>Alert.alert('error', err))                  
                    : navigation.navigate("ManageWallets")            
              },
              {text: 'No', onPress: () => {}},
            ]);
    
            return false;
        }
    
        return true;
    }

    async function refreshCheckout() {
        console.log('refreshing checkout items...');
        setShowLoadingDialog(false);
        
        await getItemsResolved()
            .then(items=>{  
                setCheckoutItems(items)
                setCheckoutItemsTotal(items.reduce((total,item)=>total + (item.count * item.price), 0));
            })
            .catch(err=>Alert.alert('error', err))
            .finally(()=>{});
        
        setShowLoadingDialog(false);
    }

    async function refreshPurchases() {
        if(!walletIsConnected("You must be connected to a wallet to view its purchases.\nConnect to a wallet?"))
            return;

        setShowLoadingDialog(true);
        console.log('refreshing purchased...')

        const tickets = await twineContext
            .getPurchaseTicketsByAuthority(twineContext.walletPubkey)
            .catch(err=>Alert.alert('error', err))
            .finally(()=>{});
        
        if(!tickets)
            return;

        const refreshedPurchases: Purchase[] = [];
        
        for(const ticket of tickets){            
            const snapshot = await twineContext
                .getProductByAddress(ticket.productSnapshot)
                .catch(err=>console.log(err));
            
            refreshedPurchases.push({purchaseTicket: ticket, productSnapshot: snapshot});
        }

        refreshedPurchases.sort((a,b)=> b?.purchaseTicket?.timestamp - a?.purchaseTicket?.timestamp);
        setPurchases(refreshedPurchases);        
        setShowLoadingDialog(false);
    }


    async function checkOut() {
        if(!walletIsConnected("You must be connected to a wallet to checkout.\nConnect to a wallet?"))
            return;

        console.log('checking out');

        if(twineContext.getCurrentWalletName() == "Local") 
        {
            const purchaseFee = await twineContext.getPurchaseFee();            
            const totalNeededForCheckout = checkoutItemsTotal + (checkoutItems.length * purchaseFee);
            const currentMaxSpend = twineContext.getCurrentWalletMaxSpend();
            const checkoutApprovalPrompt = async () => new Promise((resolve,reject) => {
                Alert.alert(
                    'Approve Checkout',
                    `The total $${totalNeededForCheckout} for this checkout is greater than your configured unprompted max spend $${currentMaxSpend}\n\nDo you approve of this checkout?`,
                    [
                        {text: 'Yes', onPress: () => resolve(true)},
                        {text: 'No', onPress: () => resolve(false)},
                    ]
                );
            });

            const checkoutApproved = await checkoutApprovalPrompt();
            if(!checkoutApproved)
                return;

            const usdcBalance = await twineContext.getTokenBalance(Mint.USDC, twineContext.walletPubkey);
            console.log('usdc balance is ', usdcBalance);
           
            if(usdcBalance < totalNeededForCheckout) 
            {
                const remainingUsdcRequired = (Math.ceil((totalNeededForCheckout - usdcBalance) * Mint.USDC.multiplier) / Mint.USDC.multiplier).toFixed(6);
                console.log('remaining usdc required: ', remainingUsdcRequired);
                const solBalancePromise = twineContext.getAccountSol(twineContext.walletPubkey);
                const solNeededPromise = twineContext.tokenSwapper.getInQuote(Mint.USDC, remainingUsdcRequired, 1, Mint.SOL);
                const [solBalance, solNeeded] = await Promise.all([solBalancePromise,solNeededPromise]);
                const remainingSolNeeded = solNeeded.amount - solBalance;
                const balanceMessage = `You need $${remainingUsdcRequired} more USDC to cover the payment.\n`;
                if(remainingSolNeeded > 0) 
                {
                    Alert.alert('Insufficient Funds', `${balanceMessage}\nPlease transfer more funds into your wallet.`);
                    return;
                }
                else 
                {
                    const swapPrompt = async () => new Promise((resolve,reject) => {
                        Alert.alert(
                            'Auto Swap?',
                            `${balanceMessage}\nWould you like to convert ${solNeeded.amount} SOL to USDC to cover the payment?`,
                            [
                                {text: 'Yes', onPress: () => resolve(true)},
                                {text: 'No', onPress: () => resolve(false)},
                            ]
                        );
                    });

                    const swapApproved = await swapPrompt();
                    if(!swapApproved)
                        return;

                    setShowLoadingDialog(true);
                    const swapTransactionSignature = await twineContext.tokenSwapper
                    .swap(Mint.SOL, solNeeded.amount, 1, Mint.USDC, SCREEN_DEEPLINK_ROUTE)
                    .catch(err=>{
                        Alert.alert('error', err);
                    });
                
                    if(!swapTransactionSignature)
                        return;

                    console.log('swapTransactionSignature: ', swapTransactionSignature);
                }
            }
        }

        setShowLoadingDialog(true);
        const promises = [];
        const errors: string[] = [];

        for(const checkoutItem of checkoutItems) {
            const buyPromise = twineContext
                .buyProduct(checkoutItem, checkoutItem.count, SCREEN_DEEPLINK_ROUTE)
                .then(async ticket=>{
                    await removeItemFromCart(checkoutItem.address, checkoutItem.count);
                })
                .catch(err=>errors.push(err));//Alert.alert("error", err));

            promises.push(buyPromise);
        }

        const purchasedItems = await Promise
            .all(promises);

        setShowLoadingDialog(false);
        
        if(errors.length > 0){
            Alert.alert("errors", errors.join("\n\n"));
        }
        
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
        <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
            <Dialog.Loading />
        </Dialog>
        <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={require('../assets/images/screen_background.jpg')}
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
                        <ListItem
                            key={"purchase" + purchase.purchaseTicket?.address?.toBase58()}
                            bottomDivider
                            onPress={()=>navigation.navigate('ProductDetails',{product:purchase.productSnapshot, purchaseTicket: purchase.purchaseTicket})}
                        >
                            <Avatar source={purchase?.productSnapshot?.data?.img && {uri: purchase.productSnapshot?.data.img}} size={70} />
                            <ListItem.Content >
                                <ListItem.Title>{purchase?.productSnapshot?.data?.displayName}</ListItem.Title>
                                <ListItem.Subtitle>{purchase?.productSnapshot?.data?.displayDescription}</ListItem.Subtitle>
                                <View>
                                    <Text style={{fontSize:15}}>price: ${purchase?.productSnapshot?.price?.toString()}</Text>
                                    <Text style={{fontSize:15}}>purchased: {new Date(purchase.purchaseTicket.timestamp * 1000).toLocaleString("en-us")}</Text>
                                    <Text style={{fontSize:15}}>remaining redemptions: {purchase.purchaseTicket.remainingQuantity.toString()}</Text>                          
                                    <Text style={{fontSize:15}}>pending redemptions: {purchase.purchaseTicket.pendingRedemption?.toString()}</Text>                                    
                                    { purchase?.purchaseTicket?.expiration > 0  &&
                                        <Text style={{fontSize:15, color: purchase.purchaseTicket.expiration < Math.floor(new Date().getTime()/1000) ? 'red' : 'black',}}>
                                            expiration: {new Date(purchase.purchaseTicket.expiration * 1000).toLocaleString()}
                                        </Text>
                                    }                                    
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
