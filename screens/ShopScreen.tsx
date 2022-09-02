import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, ScrollView, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import ImageCarousel from '../components/ImageCarousel';
import { Text, View, TextInput, Button} from '../components/Themed';
import { RootTabScreenProps } from '../types';
import CarouselCards from '../components/CarouselCards'
import { HorizontalScrollView, SearchString, setSearchString, CardView } from '../components/CardView';
import { blue100 } from 'react-native-paper/lib/typescript/styles/colors';
import MarqueeText from 'react-native-marquee';
import { generateRandomString } from '../utils/random';
import * as twine from '../api/twine';


const SCREEN_DEEPLINK_ROUTE = "shop";

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(WINDOW_WIDTH);
export const ITEM_HEIGHT = Math.round(ITEM_WIDTH/4);

export default function ShopScreen({ navigation }: RootTabScreenProps<'ShopTab'>) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([] as twine.Store[]);
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);

  async function runSearch(s) {
    setActivityIndicatorIsVisible(true);

    setSearch(s);
    const stores = await twine
      .getStoresByName(s)
      .catch(err=>Alert.alert('error', err));
    
    if(stores)
      setItems(stores);

    setActivityIndicatorIsVisible(false);
  }

  useEffect(()=>{
    runSearch("");
  },[]);


  return (
    <View style={styles.container}>
       <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
          uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>

          <TextInput 
            placeholder='search...'
            placeholderTextColor='white'
            style={styles.searchbox}
            value={search}
            onChangeText={runSearch}/>
          <ScrollView  contentContainerStyle={{flexGrow:1, flexWrap: 'wrap', flexDirection:'row', alignContent: 'space-around'}}>
              {
                items.map((item)=>(
                <CardView 
                  key={item.address.toBase58()} 
                  onPress={()=>{
                    if(item.account_type == "product")
                      navigation.navigate('ProductDetails',{product: item});
                    else if (item.account_type == "store")
                      navigation.navigate('StoreDetails', {store: item})
                  }}
                  {...item}
                />
                ))
              }
          </ScrollView>
          <View style={styles.favorites}>
            <ImageBackground 
            style={{width: '100%', height: '100%'}} 
            source={{
              uri: favorites_uri,
            }}>  
              <CarouselCards navigation={navigation}/>
              <MarqueeText
                style={{ fontSize: 10, color: 'red', fontWeight: 'bold', }}
                speed={.5}
                marqueeOnStart={true}
                loop={true}
                delay={4000}>
                On SALE now! Tickets to Solana Breakpoint 2022! [Nov 4 - 7]...
                For those who eat glass, check out the new mouth band aids at the redcross store!
             </MarqueeText>
            </ImageBackground>
          </View>          
 
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 1,
    height: 2,
    width: '100%',
  },
  searchbox: {
    width: '100%',
    height: 35,
    color: 'white',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderBottomColor: 'white',
    borderBottomWidth: 2,
    marginBottom: 2,
  },
  favorites: {
    backgroundColor: 'blue',
    height: '18%',
    width: '100%',
    marginTop: .5,
    borderTopWidth: 2,
    borderTopColor: '#666666'
  },
  headerText: {
    fontSize: 16,
    //position: 'absolute',
    //bottom: SPACING * 2,
    //right: SPACING * 2,
    color: '#778888',
    fontWeight: '600',
  },
  list: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    backgroundColor: 'rgba(52, 52, 52, .025)',
    height: '100%'
  },
  column: {
    flexShrink: 1,
    flexDirection: 'column',
    width: '100%',
    height: '25%',
  },
  row: {
    width: '100%',
    height: '75%',
  },
  itemContainer: {
    backgroundColor: 'purple',
    borderRadius: 8,
    width: ITEM_WIDTH,
    height:ITEM_HEIGHT,
    //paddingBottom: 27,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 8,
    justifyContent: 'flex-start',
    //flexDirection: 'column',
    margin: 4,
  },
  itemHeader: {
    color: "#222",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 5,
    borderWidth: 2,
  },
  itemBody: {
    color: "#222",
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 10,
    borderWidth: 2,
  },
  contactIcon:{
    width:20,
    height:20,
    margin: 2,
  },
  scrollingText: {
    backgroundColor: "red",
    width: 400,
    padding: 10,
    marginBottom: 10,
  },
  welcomeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
});



const favorites_uri = 'data:image/png;base64,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';

