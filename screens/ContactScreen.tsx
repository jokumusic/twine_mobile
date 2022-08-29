import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Dimensions, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import PressableImage from '../components/PressableImage';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import * as solchat from '../api/solchat';
import { PublicKey } from '@solana/web3.js';

const SCREEN_DEEPLINK_ROUTE = "contact";
export const WINDOW_WIDTH = Dimensions.get('window').width;

export default function ContactScreen(props) {
  const navigation = useRef(props.navigation).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addContactKey,setAddContactKey]= useState("");
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);

    
  async function toggleModalVisibility() {
    setIsModalVisible(!isModalVisible);
  };

  async function allowContact() {
    setActivityIndicatorIsVisible(true);
    console.log('adding contact...');

    const allowedContact = await solchat
      .addAllow(new PublicKey(addContactKey), {directMessage: true}, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>console.log(err));

    console.log('done');
    setActivityIndicatorIsVisible(false);
  }

   return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.leftPanelHeader}>

          <Pressable
            onPress={() => setIsModalVisible(true)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}>
            <FontAwesome5
              name="plus-circle"
              size={25}
              color={'purple'}
              style={{ marginRight: 15 }}
            />
          </Pressable>
          <Modal animationType="slide" 
                   transparent visible={isModalVisible} 
                   presentationStyle="overFullScreen" 
                   onDismiss={toggleModalVisibility}>
                <View style={styles.viewWrapper}>
                    <View style={styles.modalView}>
                      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
                        <TextInput placeholder="Contact Public Key" 
                                   value={addContactKey} style={styles.textInput} 
                                   onChangeText={(value) => setAddContactKey(value)} />
  
                        <View style={{flexDirection: 'row', alignContent: 'center', width: '40%', justifyContent: 'space-between'}}>
                          <Button title="Add" onPress={allowContact} />
                          <Button title="Cancel" onPress={toggleModalVisibility} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
    },
    leftPanelHeader: {
      width: '100%',
      height: '5%',
      backgroundColor: 'orange',
    },
    screen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
  },
  viewWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalView: {
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: "50%",
      left: "50%",
      elevation: 5,
      transform: [{ translateX: -(WINDOW_WIDTH * 0.4) }, 
                  { translateY: -90 }],
      height: 180,
      width: WINDOW_WIDTH * 0.8,
      backgroundColor: "#fff",
      borderRadius: 7,
  },
  textInput: {
      width: "80%",
      borderRadius: 5,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
      marginBottom: 8,
  },
});
