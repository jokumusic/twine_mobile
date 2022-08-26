import { useState, useContext, useEffect, useRef } from "react";
import { Button, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CartContext } from "../components/CartProvider";
import { TextInput } from "../components/Themed";


export default function CartScreen(props) {
    const navigation = useRef(props.navigation).current;
    const [products, setProducts] = useState([]);
    let [total, setTotal] = useState(0);
    const {map, itemCount, addItemToCart, removeItemFromCart, getItemsResolved} = useContext(CartContext);

    useEffect(() =>{
        console.log('refreshing product list');
        console.log('before: ', itemCount);
        getItemsResolved()
            .then(items=>{         
                console.log('after: ', itemCount);       
                setProducts(items)
                setTotal(items.reduce((total,item)=>total + (item.count * item.price), 0));
            })
            .catch(err=>console.log(err));    
    },[itemCount]);

    async function checkOut(){
        console.log('checking out');
    }

    async function setItemCount(item, count) {
        if(item.count > count)
            removeItemFromCart(item.id, item.count - count)
        else if(count > item.count)
            addItemToCart(item.id, count-item.count);
        //else the difference is 0, so leave the same
   }

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
            <View key={item.id} style={styles.cartLine}>                    
                <Pressable
                    onPress={() => navigation.navigate('ProductDetails',{product:item})}
                    style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>
                    <Image source={{uri:item.img}} style={styles.lineImage} />
                </Pressable>
                
                <View style={{flexDirection: 'column'}}>
                    <Text style={styles.lineLeft}>{item.name}</Text>
                    <View style={{width: '40%'}}>
                        <Button title="delete" onPress={()=>removeItemFromCart(item.id)}/>
                    </View>
                </View>
                
                <TextInput
                    style={{width: 40, height: 40, fontSize: 18, borderWidth:1, alignContent: 'center', justifyContent: 'center'}}
                    value={item.count.toString()}
                    keyboardType='numeric'
                    editable={false}
                />

                <Text style={styles.lineRight}>$ {item.price}</Text>
            </View>
        );
        }

    return (
        <FlatList
            style={styles.itemsList}
            contentContainerStyle={styles.itemsListContainer}
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderTotal}
        />
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
