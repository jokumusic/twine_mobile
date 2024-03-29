import { Alert, Dimensions, Image, Linking, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import { Text, View } from '../components/Themed';
import {PressableImage} from '../components/Pressables';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { PressableIcon, PressableText } from '../components/Pressables';
import { AssetType } from '../api/Twine';
import SelectDropdown from 'react-native-select-dropdown'
import { Avatar, Dialog, Icon, ListItem, Button} from '@rneui/themed';
import { TwineContext } from '../components/TwineProvider';
import { Contact, ContactProfile, DirectConversation, Group} from '../api/SolChat';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import uuid from 'react-native-uuid';
import QRCode from 'react-native-qrcode-svg';
import { BarCodeScanner } from 'expo-barcode-scanner';



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
  const [addContactModalMessage, setAddContactModalMessage] = useState("");
  const [sendAssetModalVisible, setSendAssetModalVisible] = useState(false);
  const [contact, setContact] = useState<Contact>(null);
  const [addContactWalletAddress,setAddContactWalletAddress]= useState("");
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
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [createGroupDialogVisible, setCreateGroupDialogVisible] = useState(false);
  const [createGroupDialogMessage, setCreateGroupDialogMessage] = useState("");
  const [createGroupName, setCreateGroupName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [editGroup, setEditGroup] = useState<Group>();
  const [editGroupDialogVisible, setEditGroupDialogVisible] = useState(false);
  const [editGroupDialogMessage, setEditGroupDialogMessage] = useState("");
 
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      setAddContactWalletAddress(data);
      setShowScannerDialog(false);
      setAddContactModalVisible(true);
  };

  useEffect(()=>{
    //console.log('twineContext.walletPubkey change');
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

  useEffect(()=>{
    if(!contact?.address)
      return;

    console.log('getContactGroups...');
    (async ()=>{
      const results = await twineContext.solchat
        .getContactGroups(contact.address)
        .catch(err=>console.log(err.toString()));
      
      if(results) {
        setGroups(results);
      }
    })();

  }, [contact]);

  async function refreshChatWithFocusedContact() {
    
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
                //console.log("_id: ", parsedMessage._id);
                return populateMessage(parsedMessage);
              } catch(err){
                console.log(err);
              }
            })
            .filter(successfullyParsed=> successfullyParsed);

            parsedMessages.sort((a,b)=> new Date(b?.createdAt) - new Date(a?.createdAt));
            setMessages(parsedMessages);
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
    
    //setMessages(previousMessages => GiftedChat.append(previousMessages, populatedMessage));
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
            
              if(focusedContactRef.current?.address 
                  && (conversation.contact1.equals(focusedContactRef.current.address) || conversation.contact2.equals(focusedContactRef.current.address)))
              {
                const parsedMessages = conversation.messages.map(m=>{
                  try {
                    const parsedMessage = JSON.parse(m);
                    //console.log("call _id: ", parsedMessage._id);
                    const populatedMessage = populateMessage(parsedMessage);
                    return populatedMessage;
                  } catch(err){
                    console.log(err);
                  }
                })
                .filter(successfullyParsed=> successfullyParsed);

                parsedMessages.sort((a,b)=> new Date(b?.createdAt) - new Date(a?.createdAt));
                setMessages(parsedMessages);
            }
          }
        )
        .catch(err=>console.log(err));
    }
  });
 }, [allowedContacts])


  async function allowContact() {
    console.log('here');
    if(!walletIsConnected("You must be connected to wallet to add a contact.\nConnect to a wallet?"))
      return;

    if(!addContactWalletAddress){
      setAddContactModalMessage('A contact address must be specified');
      return;
    }

    setAddContactModalVisible(false);
    setShowLoadingDialog(true);
    console.log('allowing contact...');

    const addedContact = await twineContext.solchat
      .addAllowByWalletAddress(new PublicKey(addContactWalletAddress), {directMessage: true}, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>setAddContactModalMessage(err.toString()))
      .finally(()=>{
        setShowLoadingDialog(false);
      });

    if(addedContact){
      setAddContactModalVisible(false);
      setContact(addedContact);
    } else {
      setAddContactModalVisible(true);
    }
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

    setShowLoadingDialog(false);

    twineContext
      .sendAsset(sendAsset.type, focusedContact.receiver, sendAsset.amount, SCREEN_DEEPLINK_ROUTE)
      .catch(setSendAssetErrorMessage)
      .then((tx)=>{
        setSendAsset({type: AssetType.SOL, amount: 0});
        setSendAssetModalVisible(false);
      })
      .finally(()=>{
        setShowLoadingDialog(false);
      });
  }

  async function cancelSendAssetToFocusedContact() {
    setSendAssetModalVisible(false);
    setSendAsset({type: AssetType.SOL, amount: 0});
    setSendAssetErrorMessage("");
    setShowLoadingDialog(false);
  }

  async function createGroup() {
    if(!createGroupName){
      setCreateGroupDialogMessage('A group name must be specified');
      return;
    }

    setCreateGroupDialogVisible(false);
    setShowLoadingDialog(true);

    const createdGroup = await twineContext.solchat
      .createGroup(createGroupName, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>setCreateGroupDialogMessage(err.toString()))
      .finally(()=>{
        setShowLoadingDialog(false);
      });
    
    if(createdGroup){
      setCreateGroupDialogVisible(false);
      setGroups(groups.concat(createdGroup));
    } else {
      setCreateGroupDialogVisible(true);
    }
  }

  async function updateGroup() {
    if(!editGroup?.name){
      setEditGroupDialogMessage('A group name must be specified');
      return;
    }

    setEditGroupDialogVisible(false);
    setShowLoadingDialog(true);

    const updatedGroup = await twineContext.solchat
      .updateGroup(editGroup, SCREEN_DEEPLINK_ROUTE)
      .catch(err=>setEditGroupDialogMessage(err.toString()))
      .finally(()=>{
        setShowLoadingDialog(false);
      });
    console.log('updatedGroup: ', updatedGroup);

    if(updatedGroup){
      setEditGroupDialogVisible(false);
      setGroups(groups.map(g=>{
        if(g.address.equals(updatedGroup.address))
          return updatedGroup;
        else
          return g;
      }));
    } else {
      setCreateGroupDialogVisible(true);
    }
  }


   return (
    <View style={styles.container}>
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
      <View style={styles.leftPanel}>
        <View style={styles.leftPanelHeader}>
          <PressableIcon            
            style={{margin: 5}}  
            onPress={()=>{
              setAddContactModalMessage("");
              setAddContactWalletAddress("");
              setAddContactModalVisible(true);}}
            name="person-add"
            color='white'
          />
          <PressableIcon            
            style={{margin: 5}}  
            onPress={()=>{
              setCreateGroupDialogMessage("");
              setCreateGroupName("");
              setCreateGroupDialogVisible(true);
            }}
            name="people"
            color='white'
          />
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
              groups.map((group, i) => (
                <ListItem
                  key={"group_" + group.address.toBase58()}
                  containerStyle={{
                    marginHorizontal: 1,
                    marginVertical: 1,
                    borderRadius: 6,
                    padding:0,
                    backgroundColor: '#84b8ea',
                  }}
                  bottomDivider
                >
                  {/*<Avatar rounded source={group?.img && { uri: group.img }} size={45} />*/}
                  <ListItem.Content style={{flexDirection: 'row', alignContent: 'flex-start', justifyContent: 'flex-start'}}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 15, alignSelf: 'flex-start' }}>
                      {group.name}
                    </Text>
                    <PressableIcon
                      style={{marginLeft: 5}}
                      name="create-outline"
                      onPress={()=>{
                        setEditGroupDialogMessage("");
                        setEditGroup({...group});
                        setEditGroupDialogVisible(true);
                      }}
                    />
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
                onPress={()=>Linking.openURL(focusedContact.data.twitter)}/>              
              <PressableImage
                source={{uri: 'https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c521.png'}}
                style={styles.contactIcon}
                onPress={()=>Linking.openURL(focusedContact.data.instagram)}/>
              <PressableImage
                source={{uri: 'https://i.pinimg.com/564x/d1/e0/6e/d1e06e9cc0b4c0880e99d7df775e5f7c.jpg'}}
                style={styles.contactIcon}
                onPress={()=>Linking.openURL(focusedContact.data.facebook)}/>         
              <PressableImage
                source={{uri: 'https://www.freepnglogos.com/uploads/logo-website-png/logo-website-website-icon-with-png-and-vector-format-for-unlimited-22.png'}}
                style={styles.contactIcon}
                onPress={()=>Linking.openURL(focusedContact.data.web)}/>
              <PressableImage
                source={{uri: 'https://iconape.com/wp-content/png_logo_vector/wikipedia-logo.png'}}
                style={styles.contactIcon}
                onPress={()=>Linking.openURL(focusedContact.data.wiki)}/>
          </View>

            <View style={{flexDirection: 'row', alignContent: 'space-between', paddingTop: 10, backgroundColor: '#DDDDDD',}}>
              <PressableIcon
                name="cash-outline"
                color={'purple'}                
                onPress={()=>setSendAssetModalVisible(true)}
              />
              {focusedContact.receiver &&
                  <QRCode value={focusedContact.receiver?.toBase58()} size={40} style={{marginLeft: 10}} />
              }  
            </View>
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

      <Dialog isVisible={addContactModalVisible} onBackdropPress={()=>{setAddContactWalletAddress(''); setShowScannerDialog(false); setAddContactModalVisible(false);}}>
        <Dialog.Title title="Add Contact"/>
            <Text style={{color:'red'}}>{addContactModalMessage}</Text>
          <Text>allows contact to communicate with you</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput 
              placeholder="Contact Address" 
              value={addContactWalletAddress} style={styles.textInput} 
              onChangeText={(value) => setAddContactWalletAddress(value)} 
            />
            <Button
              onPress={()=>{setAddContactModalVisible(false); setShowScannerDialog(true);}}
              style={{borderRadius: 6, margin: 5,}}
            >
                <Icon type="ionicon" name="scan-outline" color="blue" />
            </Button>
          </View>    
        <Dialog.Actions>
          <Dialog.Button title="Add" onPress={() => allowContact()}/>
          <Dialog.Button title="Cancel" onPress={() =>{setAddContactWalletAddress(''); setAddContactModalVisible(false);}}/>
        </Dialog.Actions>
    </Dialog>

      <Modal 
            animationType="slide" 
            transparent 
            visible={sendAssetModalVisible} 
            presentationStyle="overFullScreen" 
            onDismiss={()=>setSendAssetModalVisible(false)}>
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
                  autoCapitalize={'words'}
                  onChangeText={(value) => setSendAsset({
                      ...sendAsset,
                      amount: value
                    })
                  }
                />

                <View style={{flexDirection: 'row', alignContent: 'center', width: '40%', justifyContent: 'space-between'}}>
                  <Button onPress={sendAssetToFocusedContact}>Send</Button>
                  <Button onPress={cancelSendAssetToFocusedContact}>Cancel</Button>
                </View>
              </View>
            </View>
          </Modal>

          
          <Dialog
            isVisible={showScannerDialog}
            onBackdropPress={()=>setShowScannerDialog(false)}
          >
            <View style={{width: WINDOW_WIDTH * 0.5, height: WINDOW_HEIGHT * 0.7, alignSelf: 'center'}}>              
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFill}
                />
            </View>  
          </Dialog>

      <Dialog isVisible={createGroupDialogVisible} onBackdropPress={()=>{setCreateGroupDialogVisible(false);}}>
        <Dialog.Title title="Create Group"/>
          <Text style={{color:'red'}}>{createGroupDialogMessage}</Text>
          
          <Text>Group Name:</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput 
              placeholder="Group Name" 
              value={createGroupName} 
              style={styles.textInput} 
              onChangeText={(value) => setCreateGroupName(value)} 
            />
          </View>    
        <Dialog.Actions>
          <Dialog.Button title="Create" onPress={() => createGroup()}/>
          <Dialog.Button title="Cancel" onPress={() =>{setCreateGroupDialogVisible(false);}}/>
        </Dialog.Actions>
      </Dialog>

      <Dialog isVisible={editGroupDialogVisible} onBackdropPress={()=>{setEditGroupDialogVisible(false);}}>
        <Dialog.Title title="Update Group"/>
          <Text style={{color:'red'}}>{editGroupDialogMessage}</Text>
          
          <Text>Group Name:</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput 
              value={editGroup?.name} 
              style={styles.textInput} 
              onChangeText={(value) => setEditGroup({...editGroup, name: value})} 
            />
          </View>    
        <Dialog.Actions>
          <Dialog.Button title="Update" onPress={() => updateGroup()}/>
          <Dialog.Button title="Cancel" onPress={() =>{setEditGroupDialogVisible(false);}}/>
        </Dialog.Actions>
      </Dialog>
          
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
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
});
