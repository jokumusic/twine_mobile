import React from "react";
import { View, ScrollView, Pressable, Image, StyleSheet, Dimensions, Text } from "react-native";
import PressableImage from './PressableImage';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(WINDOW_WIDTH) * .30;
export const ITEM_HEIGHT = ITEM_WIDTH + 35; //Math.round(ITEM_WIDTH/4);



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


const colors = ['#a2b369']; //['#10898d','#2f416b','#895a88', '#a2b369','#dd93ab'];

export const CardView = (item: any) => {
  return (
    <View style={[styles.card,{backgroundColor: colors[Math.floor(Math.random() * colors.length)],}]}>
      <Pressable onPress={()=>{}} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
        <View style={styles.cardTopRow}>
          <View style={{flex:1, flexDirection: 'row', alignContent:'flex-start'}}>
            <Image 
              source={{uri:item.imgUrl}}
              style={{width:80, height: 80}}/>
            <View >
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
              <PressableImage
                source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
                style={styles.contactIcon}
                url={item.wiki}/>
            </View>

            <View style={{flexDirection: 'column', alignContent: 'center', width: 100, margin:4}}>                          
              { item.rating &&
                <View style={{flex:1, flexDirection:'row', alignContent:'flex-start' }}>
                  <FontAwesome name="star" size={18} color={'gold'} style={{ margin:2 }}/>
                  <Text style={{fontSize:9, position: 'absolute', left: 8, top: 5}}>{Math.round(item.rating)}</Text>                  
                </View>
              }
              <Text style={{fontSize:12, flexWrap: 'wrap', flex:1}}>{item.price ? '$' + item.price.toFixed(2) : ''}</Text>  
            </View>            
          </View>
        </View>
        <View style={styles.cardMiddleRow}>             
        </View>
        <View style={styles.cardBottomRow}>   
          <Text style={styles.itemHeader}>{item.title}</Text>  
          <ScrollView>  
              <Text style={styles.itemBody}>{item.body}</Text>
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

export const favorites = [
    {
      id: 0,
      imgUrl: 'https://cryptosrus.com/wp-content/uploads/2021/12/Anatoly-Yakovenko-of-Solana-Reveals-Why-Were-Not-in-a-Crypto-Bubble.jpg',
      title: 'Anatoly Yakovenko Official',  
      body: 'Hi! Come watch me eat glass!',
      twitter: 'https://twitter.com/aeyakovenko',
      instagram: 'https://www.instagram.com/anatolyyakovenko.sola/',
      wiki:'https://everipedia.org/wiki/lang_en/anatoly-yakovenko',
    },
    {
      id: 1,
      imgUrl: 'https://www.dualipa.com/wp-content/uploads/2019/10/DONT_START_NOW.jpg',
      title: 'Dua Lipa Official',
      body: 'This is the official Dua Lipa store!',
      twitter: 'https://twitter.com/DUALIPA',
      instagram: 'https://www.instagram.com/dualipa',
      facebook: 'https://www.facebook.com/DuaLipa',
      web:'https://www.dualipa.com/',
      wiki: 'https://en.wikipedia.org/wiki/Dua_Lipa',
    },   
    {
      id: 2,
      imgUrl: 'https://theworldunplugged.files.wordpress.com/2010/11/screen-shot-2010-12-07-at-1-35-48-pm.png',
      title: 'Busy Media Inc.',  
      body: 'Busy Media Inc. is the leading distributor of music, videos, books and art!',
    },
    {
      id: 3,
      imgUrl: 'https://media.gettyimages.com/vectors/clothes-and-accessories-related-vector-banner-design-concept-modern-vector-id1341159950?k=20&m=1341159950&s=612x612&w=0&h=JQiJzyVQEH8vtbGM4LCVbW2bC6yqJRu3vDM6Bws6qp8=',
      title: 'Trendy Clothing Co.',
      body: 'All the trendy modern, old, contemporary clothes are here!',
    },
    {
      id: 4,
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
    web: 'https://www.warnerbros.com/tv/friends',
    instagram: 'https://www.instagram.com/friends/',
    rating: 5,
  },
  {
    id: 3,
    imgUrl: 'https://images.indianexpress.com/2017/06/tom-cruise-759.jpg?w=389',
    title: 'Tom Cruise Official',
    body: 'I am THE CRUISE, not the Cruz...',
    twitter: 'https://twitter.com/tomcruise',
    instagram: 'https://www.instagram.com/tomcruise',
    facebook: 'https://www.facebook.com/officialtomcruise',
    rating: 2,
  },
  {
    id: 4,
    imgUrl: 'https://cdn.mos.cms.futurecdn.net/5StAbRHLA4ZdyzQZVivm2c-1200-80.jpg.webp',
    title: 'Walmart',
    body: 'Save money. Live better.',
    twitter: 'https://twitter.com/Walmart', 
    web: 'https://walmart.com',
    rating: 2,
  },
  {
    id: 5,
    imgUrl: 'https://i.etsystatic.com/25894060/r/il/749abc/3333286358/il_794xN.3333286358_o0jb.jpg',
    title: 'Solana Baseball Cap',
    body: 'SOL|Cryptocurrency HAT|Investor Gift - Adult Unisex Size',
    price: 12.58,
    rating: 5,
  },
  {
    id: 6,
    imgUrl: 'https://www.liveabout.com/thmb/x-CXuH3y_cVVUTonmcWcgLomtXI=/700x700/filters:no_upscale():max_bytes(150000):strip_icc()/katy-perry-i-kissed-a-girl-57bb6a105f9b58cdfd3bb8ff.jpg',
    title: 'Katie Perry - I Kissed A Girl',
    body: 'Purchase song from official Katy Perry Store',
    price: 1.20,
    rating: 3,
  },
  {
    id: 7,
    imgUrl: 'https://www.producemarketguide.com/sites/default/files/Commodities.tar/Commodities/carrots_commodity-page.png',
    title: 'A Carrot',
    body: 'Buy this carrot!',
    price: 3.50,
    rating: 5,
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
    rating: 5,
  },
  {
    id: 10,
    imgUrl: 'https://cryptosrus.com/wp-content/uploads/2021/12/Anatoly-Yakovenko-of-Solana-Reveals-Why-Were-Not-in-a-Crypto-Bubble.jpg',
    title: 'Anatoly Yakovenko Official',  
    body: 'Hi! Come watch me eat glass!',
    twitter: 'https://twitter.com/aeyakovenko',
    instagram: 'https://www.instagram.com/anatolyyakovenko.sola/',
    rating: 5,
    wiki:'https://everipedia.org/wiki/lang_en/anatoly-yakovenko',
  },
  {
    id: 11,
    imgUrl: 'https://theworldunplugged.files.wordpress.com/2010/11/screen-shot-2010-12-07-at-1-35-48-pm.png',
    title: 'Busy Media Inc.',  
    body: 'Busy Media Inc. is the leading distributor of music, videos, books and art!',
    twitter:'https://',
    instagram:'https://',
    web:'https://',
    rating: 2.9,
  },
  {
    id: 12,
    imgUrl: 'https://media.gettyimages.com/vectors/clothes-and-accessories-related-vector-banner-design-concept-modern-vector-id1341159950?k=20&m=1341159950&s=612x612&w=0&h=JQiJzyVQEH8vtbGM4LCVbW2bC6yqJRu3vDM6Bws6qp8=',
    title: 'Trendy Clothing Co.',
    body: 'All the trendy modern, old, contemporary clothes are here!',
    twitter: 'https://',
    web:'https://',
    rating: 3.5,
  },
  {
    id: 13,
    imgUrl: 'https://www.dualipa.com/wp-content/uploads/2019/10/DONT_START_NOW.jpg',
    title: 'Dua Lipa Official',
    body: 'This is the official Dua Lipa store!',
    twitter: 'https://twitter.com/DUALIPA',
    instagram: 'https://www.instagram.com/dualipa',
    facebook: 'https://www.facebook.com/DuaLipa',
    rating: 4.2,
  },   
  {
    id: 14,
    imgUrl: 'https://images-na.ssl-images-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png',
    title: 'Amazon',
    body: 'Official Amazon Store',
    twitter: 'https://twitter.com/amazon',
    web: 'https://amazon.com',
    rating: 3.8
  },
];
  