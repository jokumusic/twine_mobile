import React from 'react'
import { View, Text, StyleSheet, Dimensions, Image, ScrollView } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';

export const SLIDER_WIDTH = Dimensions.get('window').width + 80
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.50)
export const ITEM_HEIGHT = Math.round(ITEM_WIDTH * 3 / 5);

const CarouselCardItem = ({ item, index }) => {
  return ( 
    <View style={styles.container} key={index}>  
      <ScrollView scrollEnabled={true}>
        <Image
          source={{ uri: item.imgUrl }}
          style={styles.image}
        />
          
        <Text style={styles.header}>{item.title}</Text>        
        
        <Text style={styles.body}>{item.body}</Text>
      </ScrollView>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
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
    paddingLeft: 20,
    paddingRight: 20
  }
})

export default CarouselCardItem