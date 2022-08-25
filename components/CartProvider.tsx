import React, {createContext, useState} from 'react';
import {MapOrEntries, useMap} from '../hooks/useMap';
import * as data from '../components/data';

//import { getProduct } from './services/ProductsService.js';

export const CartContext = createContext();

export function CartProvider(props) {
    const [map, actions] = useMap<String, number>();
    const [changeCount, setChangeCount] = useState(0);
  
    function addItemToCart(id) {
        let count = map.get(id);
        if(!count){
            actions.set(id, 1);
            setChangeCount(changeCount+1);
        } else {
            actions.set(id, count + 1);
            setChangeCount(changeCount+1);
        }
    }


    function getItemsCount() {
        console.log('getItemsCount');
        let sum = 0;
        map.forEach(value => {
            sum += value;
        });

        return sum;
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

    const getChangeCount = async () => changeCount;

    return (
        <CartContext.Provider value={{map, actions, getItemsCount, addItemToCart, getItemsResolved, getChangeCount}}>
        {props.children}
        </CartContext.Provider>
    );
}