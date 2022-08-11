import { Dimensions, StyleSheet, Image, Pressable, ColorSchemeName} from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';



const {width} = Dimensions.get('window');

const SPACING = 5;
const ITEM_LENGTH = width * 0.8; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 48;

export default function StoreDetailsScreen(props) {
    const params = props.route.params;
    const navigation = props.navigation;

    return (    
        <View style={styles.container}> 
            <Pressable
              onPress={() => navigation.navigate('EditStore',{
                name: params.name,
                image_uri: params.image_uri
              })}
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
              onPress={() => navigation.navigate('CreateProduct')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome5
                name="plus-circle"
                size={25}
                style={{ marginRight: 15 }}
              />
            </Pressable>     
        <Text style={styles.title}>{params.name} Products</Text>
        <Image source={{uri:params.image_uri}} style={styles.itemImage}/>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />  
        <Text>This is the store detail screen</Text>
        
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      flex: 1,
      //alignItems: 'center',
      //justifyContent: 'top'
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    itemImage: {
        width: '20%',
        height: '20%',
        borderRadius: BORDER_RADIUS,
        resizeMode: 'cover',
      },
  });
  