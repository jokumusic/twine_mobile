import React from 'react';
import { StyleSheet, ImageBackground, FlatList } from 'react-native';
import ImageCarousel from '../components/ImageCarousel';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import CarouselCards from '../components/CarouselCards'


export default function ShopScreen({ navigation }: RootTabScreenProps<'ShopTab'>) {
 
  return (
    <View style={styles.container}>
       <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
          uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  

          <TextInput placeholder='search...' placeholderTextColor='white' style={styles.searchbox} />
          <CarouselCards />
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    //backgroundColor: 'purple',
    width: '100%',
    height: 50,
    color: 'white',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderBottomColor: 'white',
    borderBottomWidth: 2
  }
});

