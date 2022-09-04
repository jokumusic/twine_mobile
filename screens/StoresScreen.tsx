import { StyleSheet, ImageBackground, Button, Alert } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import ImageCarousel, {ImageCarouselItem} from '../components/ImageCarousel';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as twine from '../api/twine';
import Navigation from '../navigation';
import { PressableIcon } from '../components/Pressables';
import { useFocusEffect } from '@react-navigation/native';

const SCREEN_DEEPLINK_ROUTE = "stores";

export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  const walletPubkey = useRef(twine.getCurrentWalletPublicKey());
  const [myStores, setMyStores] = useState([]);

  useFocusEffect(()=>{
    const currentWalletPubkey = twine.getCurrentWalletPublicKey();
    if(!currentWalletPubkey){
      Alert.alert(
        "connect to wallet",
        "You must be connected to a wallet to view its stores.\nConnect to a wallet?",
        [
          {text: 'Yes', onPress: () => twine.connectWallet(true, SCREEN_DEEPLINK_ROUTE)},
          {text: 'No', onPress: () => {}},
        ]);
      return;
    }

    if(walletPubkey.current != currentWalletPubkey) {
      refresh();
      walletPubkey.current = currentWalletPubkey;
    }
  });


  async function refresh() {    
    const currentWalletPubkey = twine.getCurrentWalletPublicKey()
    if(!currentWalletPubkey){
      Alert.prompt('connect to wallet', "You must be connected to a wallet to view its stores.\nConnect to a wallet?");
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


