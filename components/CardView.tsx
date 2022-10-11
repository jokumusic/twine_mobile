import React from "react";
import { View, ScrollView, Pressable, Image, StyleSheet, Dimensions, Text, Linking } from "react-native";
import {PressableImage,} from './Pressables';
import { FontAwesome } from '@expo/vector-icons';
import {socials_image} from '../constants/Socials';


export const WINDOW_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(WINDOW_WIDTH) * .30;
export const ITEM_HEIGHT = ITEM_WIDTH + 35; //Math.round(ITEM_WIDTH/4);


const colors = ['#a2b369']; //['#10898d','#2f416b','#895a88', '#a2b369','#dd93ab'];

export const CardView = (item: any) => {
  return (
    <View style={[styles.card,{backgroundColor: colors[Math.floor(Math.random() * colors.length)],}]}>
      <Pressable onPress={item.onPress} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
        <View style={styles.cardTopRow}>
          <View style={{flex:1, flexDirection: 'row', alignContent:'flex-start'}}>
            { item?.data.img ?
            <Image 
              source={{uri:item.data.img}}
              style={{width:80, height: 80, resizeMode: 'contain'}}/>
              :
              <View style={{width:80,height:80}}/>
            }

            <View>
            { item?.data?.socials?.map(social=>{
                if(social.url)
                  return (
                    <View key={social.url}>
                      <PressableImage
                        source={socials_image.get(social.name)}
                        style={styles.contactIcon}
                        onPress={()=>Linking.openURL(social.url)}
                      />
                    </View>
                  );
                else
                  return (<></>);
              })
            }
            </View>

            <View style={{flexDirection: 'column', alignContent: 'center', width: 100, margin:4}}>              
                <View style={{flex:1, flexDirection:'row', alignContent:'flex-start' }}>
                  <FontAwesome name="star" size={18} color={'gold'} style={{ margin:2 }}/>
                  <Text style={{fontSize:9, position: 'absolute', left: 8, top: 5}}>{Math.floor(Math.random() * 10 / 2)}</Text>                  
                </View>              
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

const styles = StyleSheet.create ({
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
