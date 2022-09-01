import React, {createContext, useState} from 'react';
import {MapOrEntries, useMap} from '../hooks/useMap';
import * as data from './CardView';

//import { getProduct } from './services/ProductsService.js';

export const CartContext = createContext();

export function CartProvider(props) {
    const [map, actions] = useMap<String, string>();
    const [itemCount, setItemCount] = useState(0);
  
    function addItemToCart(id, cnt = 1) {
        let count = map.get(id);
        if(count == undefined)
            count = 0;
 
        actions.set(id, count+cnt);
        setItemCount(itemCount+cnt);
    }

    function removeItemFromCart(id, cnt: number|boolean = 1) {
        const count = map.get(id);
        if(count){
            if(cnt === true) {
                actions.remove(id);
                setItemCount(itemCount - count);
            } 
            else {
                if(cnt >= count)
                    actions.remove(id);
                else
                    actions.set(id, count - cnt);
                    
                setItemCount(itemCount - cnt);
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