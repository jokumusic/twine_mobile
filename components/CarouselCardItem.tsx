import { Link } from '@react-navigation/native';
import React from 'react'
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, Linking, Pressable } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import {PressableImage} from './Pressables';

export const SLIDER_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * .5)
export const ITEM_HEIGHT = Math.round(ITEM_WIDTH * .5);


export const CarouselCardItem = ({ item, index, onPress }) => {
  return ( 
    <Pressable 
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
    <View style={styles.container} key={index}>
      <ScrollView>
        <View style={{flex:1, flexDirection:'row'}}>
          {item.data.img 
          ? <Image source={{ uri: item.data.img }} style={styles.image} />
          : <View style={styles.image}/>
          }
          <PressableImage
            show={item.data.twitter}
            source={{uri: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'}}
            style={styles.contactIcon}
            onPress={()=>Linking.openURL(item.data.twitter)}
            />
          <PressableImage
            show={item.data.instagram}
            source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
            style={styles.contactIcon}
            onPress={()=>Linking.openURL(item.data.instagram)} />
          <PressableImage
            show={item.facebook}
            source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.data.facebook)}/>            
          <PressableImage
            show={item.data.web}
            source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.data.web)}/>
          <PressableImage
            show={item.data.wiki}
            source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.data.wiki)}/>
        </View>
          
        <Text style={styles.header}>{item.data.displayName}</Text>        
        <Text style={styles.body}>{item.data.dislayDescription}</Text>
      </ScrollView>
    </View>
    </Pressable>

  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 8,
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
  },
  image: {    
    width: ITEM_WIDTH * .5,
    height: ITEM_HEIGHT * .5,
    resizeMode: 'contain',
  },
  header: {
    color: "#222",
    fontSize: 15,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingTop: 3
  },
  body: {
    color: "#222",
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 20
  },
  contactIcon:{
    width:21,
    height:21,
    margin: 2,
  }
})

export default CarouselCardItem