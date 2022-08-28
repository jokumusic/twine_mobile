import { StatusBar } from 'expo-status-bar';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

export const WINDOW_WIDTH = Dimensions.get('window').width;

export default function ContactScreen() {

   return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <Text>Contacts</Text>
      </View>
      <View style={styles.rightPanel}>
        <Text>Content</Text>
      </View>
    </View>
   )
}

const styles = StyleSheet.create({
    container:{
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'gray',
      height: '100%',
      width: '100%'      
    },
    leftPanel: {
      width: WINDOW_WIDTH / 3,
      height: '100%',
      alignSelf: 'flex-start',
      backgroundColor: 'red',
    },
    rightPanel: {
      width: '100%',
      height: '100%',
      backgroundColor: 'blue',
      alignSelf: 'flex-start',
    }
});
