import { StyleSheet, ImageBackground, Button } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import ImageCarousel, {ImageCarouselItem} from '../components/ImageCarousel';
import { useEffect, useState } from 'react';
import {getStoresByOwner} from '../components/data';
import * as Phantom from '../api/Phantom';


export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  const [myStores, setMyStores] = useState([]);
  const [myPubkey, setMyPubkey] = useState();

  useEffect(()=>{
    getStoresByOwner(myPubkey).then(stores=>{
      const carouselItems = stores.map((s)=>{
        return {
          id: s.id,
          uri: s.img,
          title: s.name,
          onPress: async () => {navigation.navigate('StoreDetails',{ name: s.name, image_uri: s.img})},
        };
      });
      
      setMyStores(carouselItems);
    });    
  },[myPubkey])

  const connectPhantom = async () => {
    await Phantom.connect(false, "stores")
    setMyPubkey(Phantom.getWalletPublicKey());
  };

  return (  
    <View style={styles.container}>   
      <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <ImageCarousel data={myStores} />  
        <Button title="Connect to Phantom Wallet" onPress={connectPhantom} />
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


