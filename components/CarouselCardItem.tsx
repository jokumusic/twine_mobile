import { Link } from '@react-navigation/native';
import React from 'react'
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, Linking, Pressable } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import PressableImage from './PressableImage'

export const SLIDER_WIDTH = Dimensions.get('window').width + 80
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * .4)
export const ITEM_HEIGHT = Math.round(ITEM_WIDTH * .4);


const CarouselCardItem = ({ item, index }) => {
  return ( 
    <View style={styles.container} key={index}>  
      <ScrollView>
        <View style={{flex:1, flexDirection:'row'}}>
          <Image
            source={{ uri: item.img }}
            style={styles.image}
          />
          <PressableImage
            show={item.twitter}
            source={{uri: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'}}
            style={styles.contactIcon}
            onPress={()=>Linking.openURL(item.twitter)}
            />
          <PressableImage
            show={item.instagram}
            source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
            style={styles.contactIcon}
            onPress={()=>Linking.openURL(item.instagram)} />
          <PressableImage
            show={item.facebook}
            source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.facebook)}/>            
          <PressableImage
            show={item.web}
            source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.web)}/>
          <PressableImage
            show={item.wiki}
            source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
            style={styles.contactIcon}            
            onPress={()=>Linking.openURL(item.wiki)}/>
        </View>
          
        <Text style={styles.header}>{item.name}</Text>        
        <Text style={styles.body}>{item.description}</Text>
      </ScrollView>
    </View>

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
  },
  header: {
    color: "#222",
    fontSize: 18,
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