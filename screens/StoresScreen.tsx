import { StyleSheet, ImageBackground, Button, Alert } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import ImageCarousel, {ImageCarouselItem} from '../components/ImageCarousel';
import { useCallback, useEffect, useState } from 'react';
import * as twine from '../api/twine';
import Navigation from '../navigation';
import { PressableIcon } from '../components/Pressables';

const SCREEN_DEEPLINK_ROUTE = "stores";

export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  const [myStores, setMyStores] = useState([]);

  async function refresh() {    
    const currentWalletPubkey = twine.getCurrentWalletPublicKey()
    if(!currentWalletPubkey){
      Alert.alert('', 'not connected to a wallet');
      return;
    }

    console.log('refreshing stores list')
    twine
      .getStoresByAuthority(currentWalletPubkey, SCREEN_DEEPLINK_ROUTE)
      .then(stores=>{
        const carouselItems = stores
          .map(store => ({             
              id: store.address.toBase58(),
              uri: store.data.img,
              title: store.name,
              onPress: async ()=>{ navigation.navigate('StoreDetails',{store}); }
          }));

        setMyStores(carouselItems);
      })
      .catch(err=>{
        Alert.alert("Error", err);
      });
  }
  
  useEffect(()=>{
   refresh();
  },[]);
  

  return (  
    <View style={styles.container}>   
      <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <ImageCarousel data={myStores} />
        <PressableIcon
          name="refresh"
          size={40}
          onPress={()=>refresh()}
        />
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
  body: {
    flex: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '90%',
  },
});


