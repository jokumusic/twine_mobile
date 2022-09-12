import { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput} from 'react-native';
import { Text, View } from '../components/Themed';
import {Contact} from '../api/SolChat';
import { Avatar, Button, Dialog, Icon } from "@rneui/themed";
import { PressableIcon } from '../components/Pressables';
import * as Clipboard from 'expo-clipboard';
import { TwineContext } from '../components/TwineProvider';
import QRCode from 'react-native-qrcode-svg';
//import * as ImagePicker from 'expo-image-picker';

const SCREEN_DEEPLINK_ROUTE = "edit_contact";

export default function EditContactScreen(props) {
    const [contact, setContact] = useState({data:{}} as Contact);
    const navigation = useRef(props.navigation).current;
    const [showLoadingDialog, setShowLoadingDialog] = useState(false);
    const {solchat} = useContext(TwineContext);
    const [pickedImage, setPickedImage] = useState();
   
    useEffect(()=>{
        solchat
            .getCurrentWalletContact()
            .then(c=> c && setContact(c))
            .catch(err=>console.log(err));
    },[]);

    const submit = async()=>{
        if(!contact) {
            console.log('contact isnt set');
            return;
        }

        setShowLoadingDialog(false);
        console.log('submitting contact data...');
        
        const updatedContact = await solchat
          .updateContact(contact, SCREEN_DEEPLINK_ROUTE)
          .catch(err=>console.log(err));
    
        if(updatedContact) {
          console.log('got updated contact');
          setContact(updatedContact);
          console.log(JSON.stringify(updatedContact));
        }
        else {
          console.log("a contact wasn't returned")
        }
        
        setShowLoadingDialog(false);
        console.log('done');
  }
/*
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    console.log(result);
  
    if (!result.cancelled) {
      setContact({...contact, data: {...contact.data, img: result.uri}});
    }
  };
*/

   return (
    <View style={styles.container}>
      <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
        <Dialog.Loading />
      </Dialog>
        <View style={styles.inputSection}>
            
            <View style={{flexDirection: 'row', marginBottom: 15}}>
              <View style={{width:'60%', flexDirection: 'column', marginRight: 4}}>
                <Text style={styles.inputLabel}>Address</Text>
                <PressableIcon
                  name="copy"
                  size={12}
                  onPress={() =>Clipboard.setString(contact?.creator?.toBase58())}
                  style={{marginLeft: 5}}
                />
                <Text style={{fontSize: 16, marginBottom:8}}>{contact?.creator?.toBase58()}</Text>
                {contact?.creator &&
                    <QRCode value={contact?.creator?.toBase58()} size={50} />
                }  
              </View>              
              <Avatar
                size={105}
                rounded
                source={contact.data?.img ? { uri: contact.data?.img } : {}}
                key={contact?.creator?.toBase58() ?? "1"}
              />
            </View>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.name}
            onChangeText={(t)=>setContact({...contact,  name: t})}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
            style={styles.inputBox}
            multiline={true}
            numberOfLines={4}
            value={contact.data.description}
            onChangeText={(t)=>setContact({...contact,  data:{ ...contact.data, description: t}})}
            />

            <Text style={styles.inputLabel}>Image</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.data.img}
            onChangeText={(t)=>setContact({...contact,  data:{ ...contact.data, img: t}})} 
            />
            {/*<Button onPress={()=>pickImage()}> <Icon type="ionicon" name="image-outline"/> </Button>*/}




            <Text style={styles.inputLabel}>twitter URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.data.twitter}
            onChangeText={(t)=>setContact({...contact,  data:{ ...contact.data, twitter: t}})}
            />

            <Text style={styles.inputLabel}>instagram URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.data.instagram}
            onChangeText={(t)=>setContact({...contact,  data:{ ...contact.data, instagram: t}})}
            />
        </View>

        <View>
        <Button 
          type="solid"         
          buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
          onPress={submit}
        >
        Submit
        </Button>
      </View>

    </View>
   )
}

const styles = StyleSheet.create({
    container: {
      //alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      flexGrow: 1
    },
    inputSection: {
      flex: 1,
      alignContent: 'flex-start',
      padding: 10,
    },
    inputLabel:{
      fontWeight: 'bold',
      fontSize: 12,
      alignContent:'flex-start'
    },
    inputBox:{
      borderWidth: 1,
      alignContent: 'flex-start',
      height: 40,
      marginBottom: 10,
    }
  
  });
  
