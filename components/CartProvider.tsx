import React, {createContext, useState} from 'react';
import {MapOrEntries, useMap} from '../hooks/useMap';
import * as data from '../components/data';

//import { getProduct } from './services/ProductsService.js';

export const CartContext = createContext();

export function CartProvider(props) {
    const [map, actions] = useMap<String, number>();
    const [itemCount, setItemCount] = useState(0);
  
    function addItemToCart(id) {
        let count = map.get(id);
        if(count == undefined)
            count = 0;
 
        actions.set(id, count+1);
        setItemCount(itemCount+1);
    }

    function removeItemFromCart(id, all=false) {
        const count = map.get(id);
        if(count){
            if(all) {
                actions.remove(id);
                setItemCount(itemCount - count);
            } 
            else {
                if(count < 2)
                    actions.remove(id);
                else
                    actions.set(id, count - 1);
                    
                setItemCount(itemCount-1);
            }
        }
    }


    async function getItemsResolved() {
        const promises = [];
        map.forEach((v,k) => {
            const promise = data.getProductById(k);
            promises.push(promise);
        });

        const products = await Promise.all(promises);
        const cartProducts = products.map((p)=>{
            return {...p, count: map.get(p.id)}
        });

        return cartProducts;
    }

    return (
        <CartContext.Provider value={{map, itemCount, addItemToCart, removeItemFromCart, getItemsResolved}}>
        {props.children}
        </CartContext.Provider>
    );
}