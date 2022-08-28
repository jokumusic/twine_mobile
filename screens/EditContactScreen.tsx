import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Platform, StyleSheet, TextInput } from 'react-native';
import { Text, View } from '../components/Themed';
import * as solchat from '../api/solchat';

const SCREEN_DEEPLINK_ROUTE = "edit_contact";

export default function EditContactScreen(props) {
    const [contact, setContact] = useState({} as solchat.Contact);
    const navigation = useRef(props.navigation).current;
    const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
   
    useEffect(()=>{
        solchat
            .getCurrentWalletContact(SCREEN_DEEPLINK_ROUTE)
            .then(c=> c && setContact(c))
            .catch(err=>console.log(err));
    },[]);

    const submit = async()=>{
        setActivityIndicatorIsVisible(true);
        console.log('submitting contact data...');
        
        const contactData = await solchat
          .updateContact(contact, SCREEN_DEEPLINK_ROUTE)
          .catch(err=>console.log(err));
    
        if(contactData) {
          setContact(contactData);
          console.log(JSON.stringify(contactData));
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
            value={contact.description}
            onChangeText={(t)=>setContact({...contact,  description: t})}
            />

            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.img}
            onChangeText={(t)=>setContact({...contact, img: t})} 
            />

            <Text style={styles.inputLabel}>twitter URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.twitter}
            onChangeText={(t)=>setContact({...contact,  twitter: t})}
            />

            <Text style={styles.inputLabel}>instagram URL</Text>
            <TextInput
            style={styles.inputBox}
            value={contact.instagram}
            onChangeText={(t)=>setContact({...contact,  instagram: t})}
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
  
