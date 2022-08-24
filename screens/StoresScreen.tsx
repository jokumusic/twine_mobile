import { StyleSheet, ImageBackground, Button } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import ImageCarousel, {ImageCarouselItem} from '../components/ImageCarousel';
import { useEffect, useState } from 'react';
import {getStoresByOwner} from '../components/data';
import * as twine from '../api/twine';


const SCREEN_DEEPLINK_ROUTE = "stores";

export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  const [myStores, setMyStores] = useState([]);
  const [myPubkey, setMyPubkey] = useState();

  useEffect(()=>{
    getStoresByOwner(myPubkey).then(stores=>{
      const carouselItems = stores.map((store)=>{
        return {
          id: store.id,
          uri: store.img,
          title: store.name,
          onPress: async () => {navigation.navigate('StoreDetails',{store})},
        };
      });
      
      setMyStores(carouselItems);
    });    
  },[myPubkey])


  async function connectWallet(){
    const walletPubkey = await twine
      .connectWallet(true, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>console.log(err));
    
    if(walletPubkey){
      setMyPubkey(walletPubkey);
    } else {
      console.log("didn't get wallet public key");
    }    
  }

  return (  
    <View style={styles.container}>   
      <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <ImageCarousel data={myStores} />  
        <Button title="Connect Wallet" onPress={connectWallet} />
      </ImageBackground>      
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
    width: '90%',
  },
});


