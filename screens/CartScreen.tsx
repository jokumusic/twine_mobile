import { useState, useContext, useEffect } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { CartContext } from "../components/CartProvider";
import * as data from '../components/data';

export default function CartScreen(props) {
    const [products, setProducts] = useState([{name:"ididi"}]);
    //const [map, action, getItemsCount] = useContext(CartContext);

    useEffect(() =>{
        const items = [];
        /*map.keys().foreach(async (productId) =>{
            const product = data.getProductById(productId);
            if(product) {
                items.push(product);
            }
        });*/
        console.log('setting products');
        setProducts(items);
    },[]);

    function Totals() {
        let [total, setTotal] = useState(0);
        useEffect(() => {
          //setTotal(getTotalPrice());
        });
        return (
           <View style={styles.cartLineTotal}>
              <Text style={[styles.lineLeft, styles.lineTotal]}>Total</Text>
              <Text style={styles.lineRight}>$ {total}</Text>
           </View>
        );
    }

    function renderItem({item}) {
        return (
            <View style={styles.cartLine}>
                <Text style={styles.lineLeft}>{item.name}</Text>
                <Text style={styles.lineRight}>$ </Text>
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
            ListFooterComponent={Totals}
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
      fontSize: 20, 
      lineHeight: 40, 
      color:'#333333' 
    },
    lineRight: { 
      flex: 1,
      fontSize: 20, 
      fontWeight: 'bold',
      lineHeight: 40, 
      color:'#333333', 
      textAlign:'right',
    },
    itemsList: {
      backgroundColor: '#eeeeee',
    },
    itemsListContainer: {
      backgroundColor: '#eeeeee',
      paddingVertical: 8,
      marginHorizontal: 8,
    },
  });
