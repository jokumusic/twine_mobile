import { StyleSheet } from 'react-native';
import { Text, View, TextInput } from '../components/Themed';
import { RootTabScreenProps } from '../types';

export default function StoresScreen({ navigation }: RootTabScreenProps<'StoresTab'>) {
  return (
  
    <View style={styles.container}>      
      <Text style={styles.title}>Your Stores</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <View style={styles.body}>
        
      </View>
      
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
