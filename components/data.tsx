import React from "react";
import { View, ScrollView, Pressable, Image, StyleSheet, Dimensions, Text, Linking } from "react-native";
import PressableImage from './PressableImage';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine } from '../target/types/twine';
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'


export const WINDOW_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(WINDOW_WIDTH) * .30;
export const ITEM_HEIGHT = ITEM_WIDTH + 35; //Math.round(ITEM_WIDTH/4);

const network = clusterApiUrl("devnet")
const connection = new Connection(network);
const programId = new PublicKey(idl.metadata.address);


export let SearchString: string ="";

export const setSearchString = (s:string) =>{
  SearchString = s;
}

export const getFavorites = async ()=>{
  const mixedItems = await getMixedItems()
  const items = mixedItems.filter(i=>i.account_type == "store");
  let list = [];

  if(SearchString) {
    const regex = new RegExp(SearchString, 'i');
    for(let d of items) {
      if(regex.test(d.name) || regex.test(d.description))
        list.push(d);
    }
  }
  else {
    Object.assign(list, items);
  }

  return list;
}

export const getStores = async ()=>{
  const items = await getMixedItems();
  let list = [];
  if(SearchString) {
    console.log('searching');
    const regex = new RegExp(SearchString, 'i');
    for(let d of items) {
      if(regex.test(d.name) || regex.test(d.description))
        list.push(d);
    }
  }
  else {
    Object.assign(list, items);
  }

  list.sort(() => 0.5 - Math.random())
  return list;
}

function getProgram(connection: Connection, pubkey: PublicKey){
  const wallet = {
    signTransaction: (tx: Transaction) => true,
    signAllTransactions: (txs: Transaction[]) => true,
    publicKey: pubkey
  };

  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  const program = new anchor.Program(idl as anchor.Idl, new PublicKey(idl.metadata.address), provider) as anchor.Program<Twine>;

  return program;  
}

export async function getStoresByOwner(ownerPubkey: PublicKey) {
  console.log('getting stores by owner');
  let items = [];
  if(!ownerPubkey)
    return items;
  
  const program = getProgram(connection, PublicKey.default);
  const stores = await program.account.store.all([{
    memcmp: { offset: 9, bytes: ownerPubkey.toBase58()}
  }]);

  console.log('store count: ', stores.length);
  stores.forEach((store,i)=>{  
    try{   
      if(store.account.data){
        const parsedStoreData = JSON.parse(store.account.data);          
        const decompressedStoreData = decompress(parsedStoreData);
        items.push({...decompressedStoreData, account_type: "store"});          
      }
    }
    catch(e){
      //console.log('exception: ', e);
      //console.log(store.account.data);
    }
  });

  return items;
}

export async function getProductsByStore(storeId: string) {
  console.log('getting products by store');
  let items = [];
  const [storePda] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("store"),
      anchor.utils.bytes.utf8.encode(storeId)
    ],  programId);
  const program = getProgram(connection, PublicKey.default);
  const products = await program.account.product.all([{
    memcmp: { offset: 42, bytes: storePda.toBase58()}
  }]);

  products.forEach((product,i)=>{  
    try{   
      if(product.account.data){
        const parsedProductData = JSON.parse(product.account.data);          
        const decompressedProductData = decompress(parsedProductData);
        items.push({...decompressedProductData, account_type: "product"});          
      }
    }
    catch(e){
      //console.log('exception: ', e);
      //console.log(store.account.data);
    }
  });

  return items;
}


export async function getProductById(productId: string) {
  let item = null;

  try
  {  
    const [productPda] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("product"),
        anchor.utils.bytes.utf8.encode(productId)
      ],  programId);

    const program = getProgram(connection, PublicKey.default);
    const product = await program.account.product.fetchNullable(productPda);
  
    if(product?.data){
      const parsedProductData = JSON.parse(product.data);          
      const decompressedProductData = decompress(parsedProductData);
      item = {...decompressedProductData, account_type: "product", price: product.cost.toNumber(), id: product.productId};
    }
  }
  catch(e){
    console.log('exception: ', e);
    //console.log(store.account.data);
  }
 
  return item;
}

async function getMixedItems() {  
  console.log('loading mixed items');
  let items = [];
  const program = getProgram(connection, PublicKey.default);
  const stores = await program.account.store.all();

  stores.forEach((store,i)=>{  
    try{   
      if(store.account.data){
        const parsedStoreData = JSON.parse(store.account.data);          
        const decompressedStoreData = decompress(parsedStoreData);
        items.push({...decompressedStoreData, account_type: "store"});          
      }
    }
    catch(e){
      //console.log('exception: ', e);
      //console.log(store.account.data);
    }  
  });

  const products = await program.account.product.all();
  products.forEach((product,i)=>{  
    try{      
      if(product.account.data){
        const parsedProductData = JSON.parse(product.account.data);
        const decompressedProductData = decompress(parsedProductData);      
        items.push({...decompressedProductData, account_type: "product"});
      }
    }
    catch(e){
      //console.log('exception: ', e);
      //console.log(product.account.data);
    }  
  });  

  return items;
}


const colors = ['#a2b369']; //['#10898d','#2f416b','#895a88', '#a2b369','#dd93ab'];

export const CardView = (item: any) => {
  return (
    <View style={[styles.card,{backgroundColor: colors[Math.floor(Math.random() * colors.length)],}]}>
      <Pressable onPress={item.onPress} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
        <View style={styles.cardTopRow}>
          <View style={{flex:1, flexDirection: 'row', alignContent:'flex-start'}}>
            <Image 
              source={{uri:item.img}}
              style={{width:80, height: 80}}/>
            <View >
              <PressableImage
                source={{uri: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'}}
                style={styles.contactIcon}
                show={item.twitter}
                onPress={()=>Linking.openURL(item.twitter)}/>              
              <PressableImage
                source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
                style={styles.contactIcon}
                show={item.instagram}
                onPress={()=>Linking.openURL(item.instagram)}/>
              <PressableImage
                source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
                style={styles.contactIcon}
                show={item.facebook}
                onPress={()=>Linking.openURL(item.facebook)}/>         
              <PressableImage
                source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
                style={styles.contactIcon}
                show={item.web}
                onPress={()=>Linking.openURL(item.web)}/>
              <PressableImage
                source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
                style={styles.contactIcon}
                show={item.wiki}
                onPress={()=>Linking.openURL(item.wiki)}/>
            </View>

            <View style={{flexDirection: 'column', alignContent: 'center', width: 100, margin:4}}>                          
              { item.rating &&
                <View style={{flex:1, flexDirection:'row', alignContent:'flex-start' }}>
                  <FontAwesome name="star" size={18} color={'gold'} style={{ margin:2 }}/>
                  <Text style={{fontSize:9, position: 'absolute', left: 8, top: 5}}>{Math.round(item.rating)}</Text>                  
                </View>
              }
              <Text style={{fontSize:12, flexWrap: 'wrap', flex:1}}>{item.price ? '$' + item.price: ''}</Text>  
            </View>            
          </View>
        </View>
        <View style={styles.cardMiddleRow}>             
        </View>
        <View style={styles.cardBottomRow}>   
          <Text style={styles.itemHeader}>{item.name}</Text>  
          <ScrollView>  
              <Text style={styles.itemBody}>{item.description}</Text>
          </ScrollView>
        </View>
        
    </Pressable>
  </View>
  );
}

export const HorizontalScrollView = (items) => {
  if(items != undefined) {
    return (
      <ScrollView horizontal={true} style={{alignContent: 'center'}}>
      {
        items.map((i)=> (  
          <CardView {...i}/>
        ))
      }
      </ScrollView>
    );
  }
 else{
    return (<View/>)
 }
}

const styles = new StyleSheet.create ({
  card: {
    borderRadius: 4,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    margin: 4,
  },
  cardTopRow:{
    backgroundColor: '#a2b369',
    height: 50,
    width: '100%',
    fontSize: 12,
  },
  cardMiddleRow:{
    //backgroundColor: 'yellow',
    height: 30,
    width: '100%',
    alignSelf: 'baseline',
  },
  cardBottomRow:{
    //backgroundColor: 'blue',
    width: '100%',
    height: '50%',
  },
  contactIcon:{
    width:17,
    height:17,
    margin: 1,
  },
  itemHeader: {
    color: "#EEEEEE",
    fontSize: 12,
    fontWeight: "bold",
    paddingLeft: 5,
    //borderWidth: 1,
    //borderColor: 'red',
    flexDirection: 'row',
  },
  itemBody: {
    fontSize: 12,
    margin: 2,
  },
});
