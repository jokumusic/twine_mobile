import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Dimensions, FlatList, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import PressableImage from '../components/PressableImage';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import * as solchat from '../api/solchat';
import { PublicKey } from '@solana/web3.js';
import { useFocusEffect } from '@react-navigation/native';

const SCREEN_DEEPLINK_ROUTE = "contact";
const {height, width} = Dimensions.get('window');
const WINDOW_HEIGHT = height;
const WINDOW_WIDTH = width;


export default function ContactScreen(props) {
  const navigation = useRef(props.navigation).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contact, setContact] = useState({} as solchat.Contact);
  const [addContactKey,setAddContactKey]= useState("");
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [allowedContacts, setAllowedContacts] = useState([] as solchat.Contact[]);


  useEffect(()=>{
    console.log('getCurrentWalletContact...');
    solchat
      .getCurrentWalletContact(SCREEN_DEEPLINK_ROUTE)
      .then((c)=>setContact(c))
      .catch(err=>console.log(err));
  },[]);

  useEffect(()=>{
    console.log('getAllowedContacts...');
    solchat
      .getAllowedContacts(contact, SCREEN_DEEPLINK_ROUTE)
      .then(contacts=>{console.log('gotAllowedContacts: ', contacts); setAllowedContacts(contacts);})
      .catch(err=>console.log(err));

 }, [contact]);


    
  async function toggleModalVisibility() {
    setIsModalVisible(!isModalVisible);
  };

  function allowContact() {
    if(!addContactKey)
      return;

    setActivityIndicatorIsVisible(true);
    console.log('allowing contact...');

    solchat
      .addAllow(new PublicKey(addContactKey), {directMessage: true}, SCREEN_DEEPLINK_ROUTE)
      .then(updatedContact=>setContact(updatedContact))
      .catch(err=>console.log(err))
      .finally(()=>{
        console.log('done');
        setIsModalVisible(false)
        setActivityIndicatorIsVisible(false);
        setAddContactKey("");
      });    
  }

  function renderContactListItem({item}){
    return (
        <Text style={{fontSize: 20}}>{item.name}</Text>
    );
  }

  function renderContactListSummary(){
    return (
      <Pressable
            onPress={() => {}}
            style={[{margin: 5},
              ({ pressed }) => ({ opacity: pressed ? 0.5 : 1,})
            ]}
            >
          <Text>{allowedContacts.length} contacts</Text>      
      </Pressable>
    );
  }

   return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.leftPanelHeader}>

          <Pressable
            onPress={() => setIsModalVisible(true)}
            style={[{margin: 5},
              ({ pressed }) => ({ opacity: pressed ? 0.5 : 1,})
            ]}
            >
            <FontAwesome5
              name="plus-circle"
              size={25}
              color={'purple'}
            />
          </Pressable>
          <Modal animationType="slide" 
                   transparent 
                   visible={isModalVisible} 
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

            <View style={styles.contactList}>
            <FlatList
              contentContainerStyle={styles.contactListContainer}
              data={allowedContacts}
              renderItem={renderContactListItem}
              keyExtractor={(item) => item.address.toBase58()}
              ListHeaderComponent={renderContactListSummary}
              ListHeaderComponentStyle={styles.contactListHeader}
            />
            </View>
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
  contactList: {
    backgroundColor: 'pink',
    borderWidth:1,
    flexDirection: 'column',
    height: WINDOW_HEIGHT,
    width: '100%',
  },
  contactListContainer: {
    backgroundColor: 'green',
    paddingVertical: 8,
    marginHorizontal: 8,
    borderWidth:1,
  },
  contactListHeader: {
    backgroundColor: 'yellow',
    marginBottom: 5,
    borderBottomWidth: 2,
  },
  contactLine: {
    flex: 1,
    fontSize: 17, 
    fontWeight: 'bold',
    lineHeight: 50, 
    color:'#333333', 
    textAlign:'right',
    flexDirection: 'row',
    height:50,
    borderWidth: 1,

  },
});
