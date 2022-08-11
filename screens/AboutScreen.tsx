import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

export default function AboutScreen() {

   return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    
        <Text style={styles.paragraph}>
        Built to allow anyone the ability to quickly shop at or open stores and allow for the proof of purchase of products.
        </Text>

        <Text style={styles.paragraph}>
        Products can be anything. E.g.: 
        </Text>
        <Text style={styles.paragraph}>
        Media(music, videos, books, etc...)
        </Text>
        <Text style={styles.paragraph}>
        Merchandise(shirts, hats, stickers, etc...)
        </Text>
        <Text style={styles.paragraph}>
        Event(tickets, prizes, etc...)
        </Text>
        <Text style={styles.paragraph}>
        Social(memberships, loyalty cards, awards, etc...)
        </Text>

        <Text style={styles.paragraph}>
        Basically anything you can think of!
        </Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  description: {
    fontSize: 17,
  },
  paragraph: {
    width: '80%',
    alignItems: 'center',
    fontSize: 17,
    paddingBottom: 5,
  }
});
