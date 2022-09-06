import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Platform, Pressable, StyleSheet, TextInput, Clipboard} from 'react-native';
import { Text, View } from '../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import * as solchat from '../api/solchat';
import { Avatar } from "@rneui/themed";
import { PressableIcon } from '../components/Pressables';

const SCREEN_DEEPLINK_ROUTE = "edit_contact";

export default function EditContactScreen(props) {
    const [contact, setContact] = useState({data:{}} as solchat.Contact);
    const navigation = useRef(props.navigation).current;
    const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
   
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

        setActivityIndicatorIsVisible(true);
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
        
        setActivityIndicatorIsVisible(false);
        console.log('done');
  }

   return (
    <View style={styles.container}>
        <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>
        <View style={styles.inputSection}>
            
            <View style={{flexDirection: 'row'}}>
              <View style={{width:'60%', flexDirection: 'column', marginRight: 4}}>
                <Text style={styles.inputLabel}>Address</Text>
                <PressableIcon
                  name="copy"
                  size={20}
                  onPress={() =>Clipboard.setString(contact?.address?.toBase58())}
                  style={{marginLeft: 5}}
                />
                <Text style={{fontSize: 16, marginBottom:8}}>{contact?.address?.toBase58()}</Text>
              </View>              
              <Avatar
                size={105}
                rounded
                source={contact.data?.img ? { uri: contact.data?.img } : {}}
                key={contact?.address?.toBase58() ?? "1"}
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

            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.data.img}
            onChangeText={(t)=>setContact({...contact,  data:{ ...contact.data, img: t}})} 
            />

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
        <Button title='Submit' onPress={submit} />
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
  
