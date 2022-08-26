import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartContext } from './CartProvider';

export function CartIcon({navigation}) {
  const {itemCount} = useContext(CartContext);
  return (
    <View style={styles.container}>
      <Text style={styles.text} 
        onPress={() => {
          navigation.navigate('CartTab');
        }}> Cart ({itemCount})</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    backgroundColor: '#5DBF9B',
    height: 33,
    padding: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});