import { useState, useContext, useEffect, useRef } from "react";
import { Button, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CartContext } from "../components/CartProvider";


export default function CartScreen(props) {
    const navigation = useRef(props.navigation).current;
    const [products, setProducts] = useState([]);
    let [total, setTotal] = useState(0);
    const {map, action, getItemsCount, getItemsResolved, getChangeCount} = useContext(CartContext);

    useEffect(() =>{
        console.log('refreshing product list');
        getItemsResolved()
            .then(items=>{                
                setProducts(items)
                setTotal(items.reduce((total,item)=>total + (item.count * item.price), 0));
            })
            .catch(err=>console.log(err));    
    },[getChangeCount]);

    async function checkOut(){
        console.log('checking out');
    }

    function renderTotal() {        
        return (
            <View>
                <View style={styles.cartLineTotal}>
                    <Text style={[styles.lineLeft, styles.lineTotal]}>Total</Text>
                    <Text style={styles.lineRight}>$ {total}</Text>
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
                
                <Text style={styles.lineLeft}>{item.name}</Text>
                <Text style={styles.lineMiddle}>X {item.count}</Text>
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
    lineLeft: {
      flex:1,
      fontSize: 20, 
      lineHeight: 50, 
      color:'#333333' 
    },
    lineMiddle: {
      marginLeft: 15,
      fontSize: 16, 
      lineHeight: 50, 
      color:'#333333' 
    },
    lineRight: { 
      flex: 1,
      fontSize: 18, 
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
