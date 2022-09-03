import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Dimensions, FlatList, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import {PressableImage} from '../components/Pressables';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as solchat from '../api/solchat';
import { PublicKey } from '@solana/web3.js';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from 'react-native-paper';
import { PressableIcon, PressableText } from '../components/Pressables';
import { AssetType } from '../api/twine';
import SelectDropdown from 'react-native-select-dropdown'
import { Asset } from 'expo-asset/build/Asset';
import * as twine from '../api/twine';


const SCREEN_DEEPLINK_ROUTE = "contact";
const {height, width} = Dimensions.get('window');
const WINDOW_HEIGHT = height;
const WINDOW_WIDTH = width;


interface SendAsset {
  type: AssetType;
  amount: number;
}

export default function ContactScreen(props) {
  const navigation = useRef(props.navigation).current;
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [sendAssetModalVisible, setSendAssetModalVisible] = useState(false);
  const [contact, setContact] = useState({} as solchat.Contact);
  const [addContactKey,setAddContactKey]= useState("");
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [allowedContacts, setAllowedContacts] = useState([] as solchat.Contact[]);
  const [focusedContact, setFocusedContact] = useState({} as solchat.Contact);
  const [sendAsset, setSendAsset] = useState({type: AssetType.SOL, amount:0} as SendAsset);
  const [sendAssetErrorMessage, setSendAssetErrorMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);

  const log = useCallback((log: string) => { 
    setLogText((logs) => [...logs, log])
  }, []);
 
  useEffect(()=>{
   updateWalletContact();
  },[]);

  function updateWalletContact(){
    console.log('getCurrentWalletContact...');
    solchat
      .getCurrentWalletContact(SCREEN_DEEPLINK_ROUTE)
      .then((c)=>{console.log('and here'); setContact(c);})
      .catch(err=>console.log(err));
  }

  useEffect(()=>{
    console.log('getAllowedContacts...');
    solchat
      .getAllowedContacts(contact, SCREEN_DEEPLINK_ROUTE)
      .then(contacts=>{
        setAllowedContacts(contacts);
        if(!contacts.some(c=>c.address == focusedContact.address))
        {
          console.log('no contacts');
          setFocusedContact({} as solchat.Contact);
        }
      })
      .catch(err=>console.log(err));
 }, [contact]);

  async function toggleAddContactModalVisibility() {
    setAddContactModalVisible(!addContactModalVisible);
  };

  async function toggleSendAssetModalVisibility() {
    setSendAssetModalVisible(!sendAssetModalVisible);
  }

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
        toggleAddContactModalVisibility();
        setActivityIndicatorIsVisible(false);
        setAddContactKey("");
      });    
  }



  function renderContactListItem({item}){
    return (
      <Pressable
        onPress={()=>setFocusedContact(item)}
        style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        })}
      >
        <View style={styles.contactListItem}>
          <Text style={{fontSize: 18}}>{item.name}</Text>    
        </View>
      </Pressable>
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


  async function sendAssetToFocusedContact(){
    console.log('sending= type: ', sendAsset.type, ', amount: ', sendAsset.amount);

    if(sendAsset.amount <= 0)
    {
      setSendAssetErrorMessage('an amount must be specified');
      return;
    }

    setActivityIndicatorIsVisible(true);

    twine
    .sendAsset(sendAsset.type, focusedContact.receiver, sendAsset.amount, SCREEN_DEEPLINK_ROUTE)
    .catch(err=>setSendAssetErrorMessage(err))
    .then((tx)=>{
      setSendAsset({type: AssetType.SOL, amount: 0});
      toggleSendAssetModalVisibility();
    })
    .finally(()=>{
      setActivityIndicatorIsVisible(true);
    });
  }

  async function cancelSendAssetToFocusedContact() {
    toggleSendAssetModalVisibility();
    setSendAsset({type: AssetType.SOL, amount: 0});
    setSendAssetErrorMessage("");
    setActivityIndicatorIsVisible(false);
  }

  async function sendChatMessage(){
    log(`${contact.name || contact.address.toBase58()}> ${chatMessage}`);
    setChatMessage("");

    log("[not functional yet...]");
    return;

    if(!chatMessage)
      return;

    solchat
      .sendMessage(chatMessage, contact.address, focusedContact.address, SCREEN_DEEPLINK_ROUTE)
      .then(transaction=>{
          log(chatMessage);
      })
      .catch(err=>{
        log(err);
      })
      .finally(()=>{
        setChatMessage("");
      });
  }

   return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.leftPanelHeader}>
          <PressableIcon name="person-add" style={{margin: 5}} color={'purple'} onPress={toggleAddContactModalVisibility} />         
          <PressableIcon name="refresh" style={{margin: 5}} color={'purple'} onPress={updateWalletContact} />
        </View>
        <Modal animationType="slide" 
            transparent 
            visible={addContactModalVisible} 
            presentationStyle="overFullScreen" 
            onDismiss={toggleAddContactModalVisibility}>
            <View style={styles.viewWrapper}>
              <View style={styles.modalView}>
                <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
                <TextInput 
                  placeholder="Contact Public Key" 
                  value={addContactKey} style={styles.textInput} 
                  onChangeText={(value) => setAddContactKey(value)} 
                />

                <View style={{flexDirection: 'row', alignContent: 'center', width: '40%', justifyContent: 'space-between'}}>
                  <Button title="Add" onPress={allowContact} />
                  <Button title="Cancel" onPress={toggleAddContactModalVisibility} />
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

          <Modal 
            animationType="slide" 
            transparent 
            visible={sendAssetModalVisible} 
            presentationStyle="overFullScreen" 
            onDismiss={toggleSendAssetModalVisibility}>
            <View style={styles.viewWrapper}>
              <View style={styles.sendAssetModalView}>
                <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
                <Text style={{color: 'red', fontStyle: 'italic'}}>{sendAssetErrorMessage}</Text>
                <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'center'}}>
                  <Text>Send to:</Text>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>{focusedContact.name}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text>Address:</Text>
                  <Text style={{fontSize: 10, fontStyle: 'italic'}}>{focusedContact.receiver?.toBase58()}</Text>
                </View>
    
                <SelectDropdown 
                  data={Object.keys(AssetType).filter(v=>isNaN(Number(v)))}
                  onSelect={(val,index)=>{ 
                    setSendAsset({...sendAsset, type: AssetType[val]});
                  }}
                  buttonStyle={{margin: 5}}
                  defaultValue={"SOL"}
                />
                <TextInput 
                  placeholder="amount to send" 
                  value={sendAsset.amount?.toString()}
                  style={styles.textInput} 
                  keyboardType='numeric'
                  onChangeText={(value) => setSendAsset({...sendAsset, amount: Number(value)})} 
                />

                <View style={{flexDirection: 'row', alignContent: 'center', width: '40%', justifyContent: 'space-between'}}>
                  <Button title="Send" onPress={sendAssetToFocusedContact} />
                  <Button title="Cancel" onPress={cancelSendAssetToFocusedContact} />
                </View>
              </View>
            </View>
          </Modal>

        </View>
        
      </View>
      <View style={styles.rightPanel}>
        <View style={styles.contentHeader}>
          { focusedContact.data && 
          <>
          <Image source={{uri:focusedContact.data.img}} style={{width: '30%', height: '100%'}}/>
          <View style={{flexDirection: 'column', width: '100%'}}>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>{focusedContact.name}</Text>
         
            <Text style={{fontStyle: 'italic', flexWrap: 'wrap', width:'100%'}}>{focusedContact.data.description}</Text>
         
            <View style={{flexDirection: 'row'}}>
            <PressableImage
                source={{uri: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'}}
                style={styles.contactIcon}
                show={focusedContact.data.twitter}
                onPress={()=>Linking.openURL(focusedContact.data.twitter)}/>              
              <PressableImage
                source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
                style={styles.contactIcon}
                show={focusedContact.data.instagram}
                onPress={()=>Linking.openURL(focusedContact.data.instagram)}/>
              <PressableImage
                source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
                style={styles.contactIcon}
                show={focusedContact.data.facebook}
                onPress={()=>Linking.openURL(focusedContact.data.facebook)}/>         
              <PressableImage
                source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
                style={styles.contactIcon}
                show={focusedContact.data.web}
                onPress={()=>Linking.openURL(focusedContact.data.web)}/>
              <PressableImage
                source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
                style={styles.contactIcon}
                show={focusedContact.data.wiki}
                onPress={()=>Linking.openURL(focusedContact.data.wiki)}/>
          </View>


            <PressableIcon
              name="cash-outline"
              color={'purple'}
              style={{marginTop: 10}}
              onPress={toggleSendAssetModalVisibility}
            />
          </View>
          </>
          }

        </View>
        <View style={{flexDirection: 'column'}}>
          <View style={{height: '83.5%'}}>
            <ScrollView
              contentContainerStyle={{
                backgroundColor: "#111",
                padding: 20,
                paddingTop: 20,
                flexGrow: 1,
              }}
              ref={scrollViewRef}
              onContentSizeChange={() => {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }}
              style={{ flex: 1 }}
            >
              {logText.map((log, i) => (
                <Text
                  selectable
                  key={`t-${i}`}
                  style={{
                  fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                  color: "#fff",
                  fontSize: 14,}}
                >
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
          <View style={{flexDirection: 'row', alignContent: 'flex-start', backgroundColor: "#111"}}>
          <TextInput 
            value={chatMessage}
            style={{backgroundColor: 'gray', borderWidth: 2, fontSize: 14,width:'60%', borderRadius: 10, justifyContent: 'flex-start', paddingLeft:10}}
            multiline={true}
            numberOfLines={3}
            onChangeText={setChatMessage}
          />
          <View style={{flexDirection: 'column', alignContent:'center', backgroundColor: "#111"}}>
            <PressableIcon
              name="md-arrow-redo-circle"
              color='lime'
              size={32}
              onPress={sendChatMessage}
            />
          </View>
        </View>
      </View>
        
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
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center',
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
  sendAssetModalView: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    elevation: 5,
    transform: [{ translateX: -(WINDOW_WIDTH * 0.4) }, 
                { translateY: -90 }],
    height: 270,
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
    //height: WINDOW_HEIGHT,
    width: '100%',
  },
  contactListContainer: {
    backgroundColor: 'green',
    borderWidth:1,
    width: '100%',
  },
  contactListHeader: {
    backgroundColor: 'yellow',
    marginBottom: 5,
    borderBottomWidth: 2,
  },
  contactListItem: {
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
  contentHeader: {
    width: '100%',
    height: '15%',
    backgroundColor: 'lime',
    flexDirection: 'row',
  },
  contactIcon:{
    width:17,
    height:17,
    margin: 1,
  },
});
