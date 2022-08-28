import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

export default function AddContactScreen() {

   return (
    <View style={styles.container}></View>
   )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: 'gray',
        height: '100%'      
      },
});
