import { StyleSheet, ImageBackground } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import ImageCarousel, {ImageCarouselItem} from '../components/ImageCarousel';


export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {


  const data: ImageCarouselItem[] = [
    {
      id: 0,
      uri: 'https://theworldunplugged.files.wordpress.com/2010/11/screen-shot-2010-12-07-at-1-35-48-pm.png',
      title: 'Busy Media Inc.',      
    },
    {
      id: 1,
      uri: 'https://media.gettyimages.com/vectors/clothes-and-accessories-related-vector-banner-design-concept-modern-vector-id1341159950?k=20&m=1341159950&s=612x612&w=0&h=JQiJzyVQEH8vtbGM4LCVbW2bC6yqJRu3vDM6Bws6qp8=',
      title: 'Trendy Clothing Co.',
    },
    {
      id: 2,
      uri: 'https://www.dualipa.com/wp-content/uploads/2019/10/DONT_START_NOW.jpg',
      title: 'Dua Lipa Official',
    },
    {
      id: 3,
      uri: 'https://images.indianexpress.com/2017/06/tom-cruise-759.jpg?w=389',
      title: 'Tom Cruise Official',
    },
  ];

  data.forEach((d)=>d.onPress= async ()=>{
    navigation.navigate('StoreDetails',{ name: d.title, image_uri: d.uri});
  });

  return (  
    <View style={styles.container}>   
      <ImageBackground 
        style={{width: '100%', height: '100%'}} 
        source={{
            uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/crystal_background.jpg',
        }}>  
        <ImageCarousel data={data} />  
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


