import { ActivityIndicator, Alert, Button, Dimensions, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import {PressableImage} from '../components/Pressables';
import { useContext, useEffect, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { PressableIcon, PressableText } from '../components/Pressables';
import { AssetType } from '../api/Twine';
import SelectDropdown from 'react-native-select-dropdown'
import { Avatar, Dialog, Icon, ListItem } from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';
import { Contact, ContactProfile, DirectConversation} from '../api/SolChat';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import uuid from 'react-native-uuid';


const SCREEN_DEEPLINK_ROUTE = "contact";
const {height, width} = Dimensions.get('window');
const WINDOW_HEIGHT = height;
const WINDOW_WIDTH = width;


interface SendAsset {
  type: AssetType;
  amount: number;
}

const mockGroups = [];

export default function ContactScreen(props) {
  const navigation = useRef(props.navigation).current;
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [sendAssetModalVisible, setSendAssetModalVisible] = useState(false);
  const [contact, setContact] = useState(null);
  const [addContactKey,setAddContactKey]= useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [allowedContacts, setAllowedContacts] = useState([] as Contact[]);
  const [focusedContact, setFocusedContact] = useState({} as Contact);
  const [sendAsset, setSendAsset] = useState({type: AssetType.SOL, amount:0} as SendAsset);
  const [sendAssetErrorMessage, setSendAssetErrorMessage] = useState('');
  const [logText, setLogText] = useState<string[]>([]);
  const [contactAccordionExpanded, setContactAccordionExpanded] = useState(true);
  const [groupAccordionExpanded, setGroupAccordionExpanded] = useState(true);
  const [messages, setMessages] = useState([]);
  const twineContext = useContext(TwineContext);
  const focusedContactRef = useRef(focusedContact);
 


  useEffect(()=>{
    console.log('twineContext.walletPubkey change');
    if(!walletIsConnected("You must be connected to a wallet to view its communities.\nConnect to a wallet?"))
      return;
  
      const fetchedContact = twineContext.solchat
        .getCurrentWalletContact()
        .then(setContact)     
        .catch(console.log);
        console.info('setting contact');

  },[twineContext.walletPubkey]);

  useEffect(()=>{
    if(!contact?.address)
      return;

    console.log('getAllowedContacts...');
    twineContext.solchat
      .getAllowedContacts(contact)
      .then(contacts=>{
        setAllowedContacts(contacts);
        /*if(focusedContact?.address && !contacts.some(c=>c.address.equals(focusedContact?.address)))
        {
          setFocusedContact({} as solchat.Contact); //unset focused contact, if they're not in the allowed list anymore
        }*/
      })
      .catch(err=>console.log(err));
  }, [contact]);

  async function refreshChatWithFocusedContact() {
    setMessages([]);
    if(!focusedContact?.address)
      return;
    

    if(!contact?.address)
      return;

      console.log('getting direct messages...');
      twineContext.solchat
        .getDirectMessages(contact.address, focusedContact.address)
        .then(conversation=>{
         
          const parsedMessages = conversation.messages
            .map(m=>{
              try {
                const parsedMessage = JSON.parse(m);
                return populateMessage(parsedMessage);
              } catch(err){
                console.log(err);
              }
            })
            .filter(successfullyParsed=> successfullyParsed);

            parsedMessages.sort((a,b)=> new Date(b?.createdAt) - new Date(a?.createdAt));
            setMessages(previousMessages => GiftedChat.append(previousMessages, parsedMessages));
        })
        .catch(appendSystemErrorMessage);
  }

  useEffect(() => {   
    refreshChatWithFocusedContact();
  }, [focusedContact]);

  function appendSystemErrorMessage(text:string) {
    const errMessage = {
      _id: uuid.v4().toString(),
      text,
      createdAt: new Date().getUTCDate(),
      system: true
    };

    setMessages(previousMessages => GiftedChat.append(previousMessages, errMessage));
  }

  function populateMessage(message) {
      const c = message.user._id == contact?.address?.toBase58() ? contact
                  : message.user._id == focusedContactRef.current?.address?.toBase58() ? focusedContactRef.current
                  : null;

      if(!c)
        return message;
      
      return {
        ...message,
        user: {
          _id: c?.address?.toBase58(),
          name: c?.name,
          avatar: c?.data?.img,
        }
      };
  }

  const onSend = async (messages = []) => {
    if(messages.length < 1)
      return;

    if(!contact?.address) {
      console.log(contact?.address);
      appendSystemErrorMessage("You're not associated with a contact right now.");
      return;
    }

    if(!focusedContact?.address) {
      appendSystemErrorMessage("You must select a contact to send a message to");
      return;
    }

    const message = {...messages[0], user: { _id: contact?.address?.toBase58()}};
    const messageString = JSON.stringify(message);

    const signature = await twineContext.solchat
      .sendDirectMessage(messageString, contact.address, focusedContact.address, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>appendSystemErrorMessage(err));
    
    if(!signature)
      return;
    
    const populatedMessage = populateMessage(message);
    
    setMessages(previousMessages => GiftedChat.append(previousMessages, populatedMessage));
  }

  function walletIsConnected(msg){
    if(!twineContext.walletPubkey){
      Alert.alert(
        "connect to wallet",
        msg, //"wallet name: " + twineContext.getCurrentWalletName() + "\nAddress: " + twineContext.walletPubkey?.toBase58(),
        [
          {text: 'Yes', onPress: () =>
                twineContext.getCurrentWalletName() == "Phantom"
                ? twineContext.connectWallet(true, SCREEN_DEEPLINK_ROUTE).catch(err=>Alert.alert('error', err))                  
                : navigation.navigate("ManageWallets")            
          },
          {text: 'No', onPress: () => {}},
        ]);

        return false;
    }

    return true;
  }



 useEffect(()=>{
  if(!allowedContacts || allowedContacts.length < 1)
    return;

  console.log('subscribing to conversations with allowed contacts...');
  allowedContacts.forEach(c=>{
    if(contact?.address && c?.address) {
      twineContext.solchat
        .subscribeToConversationBetween(contact, c, 
          (conversation: DirectConversation)=> {
            console.log('got conversation subscription callback');
            setMessages([]);
            
              if(focusedContactRef.current?.address 
                  && (conversation.contact1.equals(focusedContactRef.current.address) || conversation.contact2.equals(focusedContactRef.current.address)))
              {
                const parsedMessages = conversation.messages.map(m=>{
                  try {
                    const parsedMessage = JSON.parse(m);
                    const populatedMessage = populateMessage(parsedMessage);
                    return populatedMessage;
                  } catch(err){
                    console.log(err);
                  }
                })
                .filter(successfullyParsed=> successfullyParsed);

                parsedMessages.sort((a,b)=> new Date(b?.createdAt) - new Date(a?.createdAt));
                setMessages(previousMessages => GiftedChat.append(previousMessages, parsedMessages));
            }
          }
        )
        .catch(err=>console.log(err));
    }
  });
 }, [allowedContacts])

  async function toggleAddContactModalVisibility() {
    setAddContactModalVisible(!addContactModalVisible);
  };

  async function toggleSendAssetModalVisibility() {
    setSendAssetModalVisible(!sendAssetModalVisible);
  }

  function allowContact() {
    if(!walletIsConnected("You must be connected to wallet to add a contact.\nConnect to a wallet?"))
      return;

    if(!addContactKey)
      return;

    setShowLoadingDialog(true);
    console.log('allowing contact...');

    twineContext.solchat
      .addAllow(new PublicKey(addContactKey), {directMessage: true}, SCREEN_DEEPLINK_ROUTE)
      .then(updatedContact=>setContact(updatedContact))
      .catch(err=>console.log(err))
      .finally(()=>{
        console.log('done');
        toggleAddContactModalVisibility();
        setShowLoadingDialog(false);
        setAddContactKey("");
      });    
  }

  async function sendAssetToFocusedContact(){
    if(!focusedContact?.address)
      return;

    console.log('sending= type: ', sendAsset.type, ', amount: ', sendAsset.amount);

    if(sendAsset.amount <= 0)
    {
      setSendAssetErrorMessage('an amount must be specified');
      return;
    }

    setShowLoadingDialog(true);

    twineContext
      .sendAsset(sendAsset.type, focusedContact.receiver, sendAsset.amount, SCREEN_DEEPLINK_ROUTE)
      .catch(setSendAssetErrorMessage)
      .then((tx)=>{
        setSendAsset({type: AssetType.SOL, amount: 0});
        toggleSendAssetModalVisibility();
      })
      .finally(()=>{
        setShowLoadingDialog(false);
      });
  }

  async function cancelSendAssetToFocusedContact() {
    toggleSendAssetModalVisibility();
    setSendAsset({type: AssetType.SOL, amount: 0});
    setSendAssetErrorMessage("");
    setShowLoadingDialog(false);
  }

   return (
    <View style={styles.container}>
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
      <View style={styles.leftPanel}>
        <View style={styles.leftPanelHeader}>
          <PressableIcon name="person-add" style={{margin: 5}} color={'white'} onPress={toggleAddContactModalVisibility} />         
          {/*<PressableIcon name="refresh" style={{margin: 5}} color={'white'} onPress={updateWalletContact} />*/}
        </View>

        <View style={styles.contactList}>
          <ListItem.Accordion
              content={
                <>
                  <Icon type="ionicon" name="person" size={25} />
                  <ListItem.Content>
                    <ListItem.Title>Contacts</ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={contactAccordionExpanded}
              onPress={() => {
                setContactAccordionExpanded(!contactAccordionExpanded);
              }}
              containerStyle={{padding:3,backgroundColor:'#C1D5EE'}}
            >
            <ScrollView>
            {
            allowedContacts.map((c) => (
              <ListItem
                key={c.address.toBase58()}
                containerStyle={{
                  marginHorizontal: 1,
                  marginVertical: 1,
                  borderRadius: 6,
                  padding:0,
                  backgroundColor: '#88bed2',
                }}
                bottomDivider
                onPress={()=>{focusedContactRef.current = c; setFocusedContact(c);}}
              >
                <Avatar rounded source={c.data?.img && { uri: c.data.img }} size={45} />
                <ListItem.Content>
                  <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 14 }}>
                    {c.name}
                  </Text>
                </ListItem.Content>
              </ListItem>
              )
            )
            }
            </ScrollView>
          </ListItem.Accordion>
          <ListItem.Accordion
              content={
                <>
                  <Icon name="groups" size={25} />
                  <ListItem.Content>
                    <ListItem.Title>Groups</ListItem.Title>
                  </ListItem.Content>
                </>
              }              
              isExpanded={groupAccordionExpanded}
              onPress={() => {
                setGroupAccordionExpanded(!groupAccordionExpanded);
              }}
              containerStyle={{padding:3,backgroundColor:'#C1D5EE'}}
            >
            <ScrollView>
            {
              mockGroups.map((group, i) => (
                <ListItem
                  key={"group" + i}
                  containerStyle={{
                    marginHorizontal: 1,
                    marginVertical: 1,
                    borderRadius: 6,
                    padding:0,
                    backgroundColor: '#84b8ea',
                  }}
                  bottomDivider
                >
                  <Avatar rounded source={group?.img && { uri: group.img }} size={45} />
                  <ListItem.Content>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 14 }}>
                      {group.name}
                    </Text>
                  </ListItem.Content>
                </ListItem>
                )
              )
            }
            </ScrollView>
            </ListItem.Accordion>
        </View>          
        
      </View>
      <View style={styles.rightPanel}>
        <View style={styles.contentHeader}>
          { focusedContact.data && 
          <>
          <Image source={{uri:focusedContact.data.img}} style={{width: '30%', height: '100%'}}/>
          <View style={{flexDirection: 'column', width: '100%', backgroundColor: '#DDDDDD'}}>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>{focusedContact.name}</Text>
         
            <Text style={{fontStyle: 'italic', flexWrap: 'wrap', width:'100%'}}>{focusedContact.data.description}</Text>
         
            <View style={{flexDirection: 'row', backgroundColor: '#DDDDDD'}}>
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
        <View style={{width:'65%',height: '85%'}}>
          <GiftedChat
            messagesContainerStyle={{ backgroundColor: 'white'}}
            alwaysShowSend
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: contact?.address,
            }}
            showAvatarForEveryMessage
          />
        </View>
      </View>

      <Modal animationType="slide" 
        transparent 
        visible={addContactModalVisible} 
        presentationStyle="overFullScreen" 
        onDismiss={toggleAddContactModalVisibility}>
        <View style={styles.viewWrapper}>
          <View style={styles.modalView}>
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

      <Modal 
            animationType="slide" 
            transparent 
            visible={sendAssetModalVisible} 
            presentationStyle="overFullScreen" 
            onDismiss={toggleSendAssetModalVisibility}>
            <View style={styles.viewWrapper}>
              <View style={styles.sendAssetModalView}>
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
                  keyboardType='decimal-pad'
                  autoCapitalize={sendAsset?.type == AssetType.LAMPORT ? 'none' : 'words'}
                  onChangeText={(value) => setSendAsset({
                      ...sendAsset,
                      amount: value
                    })
                  }
                />

                <View style={{flexDirection: 'row', alignContent: 'center', width: '40%', justifyContent: 'space-between'}}>
                  <Button title="Send" onPress={sendAssetToFocusedContact} />
                  <Button title="Cancel" onPress={cancelSendAssetToFocusedContact} />
                </View>
              </View>
            </View>
          </Modal>
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
      width: '35%',
      height: '100%',
      alignSelf: 'flex-start',
      backgroundColor: '#EEEEEE',
    },
    rightPanel: {
      width: '100%',
      height: '100%',
      alignSelf: 'flex-start',
    },
    leftPanelHeader: {
      width: '100%',
      height: '5%',
      backgroundColor: '#88bed2',
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
    backgroundColor: '#EEEEEE',
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
    flexDirection: 'row',
    backgroundColor: '#DDDDDD',
    borderBottomWidth:1,
  },
  contactIcon:{
    width:17,
    height:17,
    margin: 1,
  },
});
