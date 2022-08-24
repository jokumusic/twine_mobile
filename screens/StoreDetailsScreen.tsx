import {
   Dimensions,
   StyleSheet,
   Image,
   Pressable,
   ColorSchemeName,
   ImageBackground,
  FlatList
  } from 'react-native';
import { Text, View, TextInput, Button} from '../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { Card } from 'react-native-paper';

const spacing = 10;
const width = (Dimensions.get('window').width - 4 * 10) / 2;
const height = width;
const data = [
  {
    id: '1',
    text: 'OneRepublic - Human',
    img: 'https://westernnews.media.clients.ellingtoncms.com/img/photos/2020/12/29/OneRepublic_t715.jpg?529764a1de2bdd0f74a9fb4f856b01a9d617b3e9',
    height: 100,
  },
  {
    id: '2',
    text: '311 - Music',
    img: 'https://upload.wikimedia.org/wikipedia/en/c/cb/311_-_Music_album_cover.jpg',
    height: 200,
  },
  {
    id: '3',
    text: 'Camila Cabello - Havana',
    img: 'https://i.pinimg.com/originals/4e/b4/f8/4eb4f8a7e04b57e74914fc46e013ac40.jpg',
    height: 200,
  },
  {
    id: '4',
    text: 'HBO\'s Mosaic Soundtrack',
    img: 'http://filmmusicreporter.com/wp-content/uploads/2018/05/mosaic.jpg',
    height: 200,
  },
];

export default function StoreDetailsScreen(props) {
  const [store, setStore] = useState(props.route.params.store);
  const navigation = useRef(props.navigation).current;
  const keyExtractor = (item) => item.id;
  
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Image source={{uri:item.img}} style={{width:'100%', height: '100%'}}/>
      <Text style={{margin: 10}}>
        {item.text}
      </Text>
    </View>
  );
      
    return (    
      <View style={styles.container}>
         <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
          uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <View style={styles.header}>        
            <Pressable
              onPress={() => navigation.navigate('EditStore',{store})}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome5
                name="edit"
                size={25}
                style={{ marginRight: 15 }}
              />
            </Pressable>  
            <Pressable
              onPress={() => navigation.navigate('CreateProduct',{store})}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome5
                name="plus-circle"
                size={25}
                style={{ marginRight: 15 }}
              />
            </Pressable>     

        <Text style={styles.title}>{store.name} Products</Text>
        <Image source={{uri:store.img}} style={styles.itemImage}/>
        </View>  
    

        <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.column}
      />
      </ImageBackground>
      </View>    
    );
}

const styles = StyleSheet.create({
    container:{
      backgroundColor: 'gray',
      height: '100%'      
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row-reverse',
      backgroundColor: 'gray',
      height: '10%',
      marginBottom: 10,
    },
    rowContainer: {
      /*flex: 1,
      alignItems: 'center',
      justifyContent: 'space-evenly',
      flexDirection: 'column',*/
    },
    row:{
      
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-evenly',   
      flexDirection: 'column',
      
      backgroundColor: 'yellow',
      margin: 10,
      flexShrink: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      //flex: 1,
      //alignItems: 'center',
      //justifyContent: 'top'
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '90%',
    },
    itemImage: {
        width: '20%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
      },
      
      list: {
        justifyContent: 'space-around',
        flexDirection: 'row'
      },
      column: {
        flexShrink: 1,
        flexDirection: 'column',
        width: width,
        height: height,
      }
  });
  