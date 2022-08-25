import React, {createContext} from 'react';
import {MapOrEntries, useMap} from '../hooks/useMap';

//import { getProduct } from './services/ProductsService.js';

export const CartContext = createContext();

export function CartProvider(props) {
    const [map, actions] = useMap<String, number>();
  
    function addItemToCart(id) {
        let count = map.get(id);
        if(!count){
            actions.set(id, 1);
        } else {
            actions.set(id, count + 1);
        }
    }


    function getItemsCount() {
        let sum = 0;
        map.forEach(value => {
            sum += value;
        });

        return sum;
    }

    return (
        <CartContext.Provider value={{map, actions, getItemsCount, addItemToCart}}>
        {props.children}
        </CartContext.Provider>
    );
}