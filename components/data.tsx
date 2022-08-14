import React from "react";
import { View, ScrollView, Pressable, Image, StyleSheet, Dimensions, Text } from "react-native";
import PressableImage from './PressableImage';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(WINDOW_WIDTH) * .30;
export const ITEM_HEIGHT = ITEM_WIDTH; //Math.round(ITEM_WIDTH/4);



export let SearchString: string ="";

export const setSearchString = (s:string) =>{
  SearchString = s;
}

export const getFavorites = ()=>{
  let list = [];
  if(SearchString) {
    const regex = new RegExp(SearchString, 'i');
    favorites.forEach((d)=>{
      if(regex.test(d.title) || regex.test(d.body))
        list.push(d);
    });
  }
  else {
    Object.assign(list, favorites);
  }

  return list;
}

export const getStores = ()=>{
  let list =[]
  if(SearchString) {
    const regex = new RegExp(SearchString, 'i');
    let list = [];
    mixedItems.forEach((d)=>{
      if(regex.test(d.title) || regex.test(d.body))
        list.push(d);
    });
  }
  else {
    Object.assign(list, mixedItems);
  }

  list.sort(() => 0.5 - Math.random())
  return list;
}


const colors = ['pink','orange','red','green','blue','purple','white','lime','#22FFFF','#00FFFF','#118681','#4499FF','#125533','#047582'];

export const CardView = (item: any) => {
  console.log(item.title)
  return (
    <View style={[styles.card,{backgroundColor: colors[Math.floor(Math.random() * colors.length)],}]}>
      <Pressable onPress={()=>{}} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
        <View style={styles.header}>
          <Image 
            source={{uri:item.imgUrl}}
            style={{width:ITEM_WIDTH/2, height: ITEM_HEIGHT/2}}/>
          <Text>{item.price}</Text>
        </View>
        <View style={{flex:1, flexDirection: 'row', alignContent:'flex-end', flexWrap: 'nowrap', height:30}}>
          <PressableImage
            source={{uri: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'}}
            style={styles.contactIcon}
            url={item.twitter}
          />
          <PressableImage
            source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
            style={styles.contactIcon}
            url={item.instagram}/>
          <PressableImage
            source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
            style={styles.contactIcon}
            url={item.facebook}/>          
          <PressableImage
            source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
            style={styles.contactIcon}
            url={item.web}/>
        </View>
        <View >
          <Text style={styles.itemHeader}>{item.title}</Text>
          <Text style={styles.itemBody}>{item.body}</Text>
          <Text style={styles.itemBody}>{item.price} USDC</Text>
        </View>
    </Pressable>
  </View>
  );
}

export const HorizontalScrollView = (items : []) => {
  items = getStores().slice(0,4);
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
    borderRadius: 8,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT + 100,
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
  contactIcon:{
    width:22,
    height:22,
    margin: 1,
  },
  itemHeader: {
    color: "#222",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 5,
    borderWidth: 1,
    borderColor: 'red'
  },
  itemBody: {
    color: "#222",
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 10,
    borderWidth: 1,
  },
});

export const favorites = [
    {
      id: -1,
      imgUrl: 'https://cryptosrus.com/wp-content/uploads/2021/12/Anatoly-Yakovenko-of-Solana-Reveals-Why-Were-Not-in-a-Crypto-Bubble.jpg',
      title: 'Anatoly Yakovenko Official',  
      body: 'Hi! Come watch me eat glass!',
      twitter: 'https://twitter.com/aeyakovenko',
      instagram: 'https://www.instagram.com/anatolyyakovenko.sola/',
    },
    {
      id: 0,
      imgUrl: 'https://theworldunplugged.files.wordpress.com/2010/11/screen-shot-2010-12-07-at-1-35-48-pm.png',
      title: 'Busy Media Inc.',  
      body: 'Busy Media Inc. is the leading distributor of music, videos, books and art!',
      twitter:'https://',
      instagram:'https://',
      web:'https://',  
    },
    {
      id: 1,
      imgUrl: 'https://media.gettyimages.com/vectors/clothes-and-accessories-related-vector-banner-design-concept-modern-vector-id1341159950?k=20&m=1341159950&s=612x612&w=0&h=JQiJzyVQEH8vtbGM4LCVbW2bC6yqJRu3vDM6Bws6qp8=',
      title: 'Trendy Clothing Co.',
      body: 'All the trendy modern, old, contemporary clothes are here!',
      twitter: 'https://',
      web:'https://',  
    },
    {
      id: 2,
      imgUrl: 'https://www.dualipa.com/wp-content/uploads/2019/10/DONT_START_NOW.jpg',
      title: 'Dua Lipa Official',
      body: 'This is the official Dua Lipa store!',
      twitter: 'https://twitter.com/DUALIPA',
      instagram: 'https://www.instagram.com/dualipa',
      facebook: 'https://www.facebook.com/DuaLipa'
    },   
    {
      id: 5,
      imgUrl: 'https://images-na.ssl-images-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png',
      title: 'Amazon',
      body: 'Official Amazon Store',
      twitter: 'https://twitter.com/amazon',
      web: 'https://amazon.com'
    },
  ];

export const mixedItems = [
  {
    id: 2,
    imgUrl: 'https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NTkxLTgwZWEtOWVhYjZlYjllYmU4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg',
    title: 'Friends Official',
    body: 'Your F.R.I.E.N.D.S store',
  },
  {
    id: 3,
    imgUrl: 'https://images.indianexpress.com/2017/06/tom-cruise-759.jpg?w=389',
    title: 'Tom Cruise Official',
    body: 'This is Tom Cruise Missle\'s store',
    twitter: 'https://twitter.com/tomcruise',
    instagram: 'https://www.instagram.com/tomcruise',
    facebook: 'https://www.facebook.com/officialtomcruise',
  },
  {
    id: 4,
    imgUrl: 'https://cdn.mos.cms.futurecdn.net/5StAbRHLA4ZdyzQZVivm2c-1200-80.jpg.webp',
    title: 'Walmart',
    body: 'Save money. Live better.',
    twitter: 'https://twitter.com/Walmart', 
    web: 'https://walmart.com'
  },
  {
    id: 5,
    imgUrl: 'https://i.etsystatic.com/25894060/r/il/749abc/3333286358/il_794xN.3333286358_o0jb.jpg',
    title: 'Solana Baseball Cap',
    body: 'SOL|Cryptocurrency HAT|Investor Gift - Adult Unisex Size',
    price: 12.58,
  },
  {
    id: 6,
    imgUrl: 'https://www.liveabout.com/thmb/x-CXuH3y_cVVUTonmcWcgLomtXI=/700x700/filters:no_upscale():max_bytes(150000):strip_icc()/katy-perry-i-kissed-a-girl-57bb6a105f9b58cdfd3bb8ff.jpg',
    title: 'Katie Perry - I Kissed A Girl',
    body: 'Purchase song from official Katy Perry Store',
    price: 1.20,
  },
  {
    id: 7,
    imgUrl: 'https://www.producemarketguide.com/sites/default/files/Commodities.tar/Commodities/carrots_commodity-page.png',
    title: 'A Carrot',
    body: 'Buy my carrot!',
    price: 3.50,
  },
  {
    id: 8,
    imgUrl: 'https://res.cloudinary.com/bizzaboprod/image/upload/c_crop,g_custom,f_auto/v1633703800/fpxdwrdnd6wan7opc15f.png',
    title: 'Solana Breakpoint 2022 Ticket',
    body: 'This ticket is good for entry at Solana Breakpoint 2022!',
    price: 1000,
  },
  {
    id: 9,
    imgUrl: 'https://images.albertsons-media.com/is/image/ABS/123050070?$ecom-pdp-desktop$&defaultImage=Not_Available',
    title: 'SPAM Classic 25% Less Sodium - 12 Oz',
    body: 'The real stuff just tastes better...',
    price: 3.5,
  },
];
  