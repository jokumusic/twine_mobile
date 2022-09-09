import { FontAwesome } from '@expo/vector-icons';
import { Image, ScrollView, SliderComponent, StyleSheet } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { View } from '../components/Themed';
import { Avatar, Button, Dialog, Icon, Text, Input} from "@rneui/themed";
import { TwineContext } from '../components/TwineProvider';
import { useContext, useEffect, useState } from 'react';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import { web3 } from '../dist/browser';


const phantomWalletChoice = {
    id:'Phantom',
    label: 'Phantom',
    description: 'This wallet will always be called for all transactions over max spend',
    value: 'Phantom',
};

export default function ManageWalletsScreen(props) {
    const twineContext = useContext(TwineContext);
    const [localWalletKeys, setLocalWalletKeys] = useState();
    const [walletChoices, setWalletChoices] = useState<RadioButtonProps>([phantomWalletChoice]);
    const [showCreateWalletDialog, setShowCreateWalletDialog] = useState(false);
    const [walletName, setWalletName] = useState('');
    const [walletMaxSpend, setWalletMaxSpend] = useState<number>();
    const [showLoadingDialog, setShowLoadingDialog] = useState(false);
    
    useEffect(()=>{
        if(!showCreateWalletDialog) {
            loadKeys();
        }
    },[showCreateWalletDialog])
    
    async function createLocalWallet(){
        setShowLoadingDialog(true);
        const createdWallet = await twineContext.createLocalWallet(walletName, walletMaxSpend);
        //console.log('createdWallet:', createdWallet);
        setShowLoadingDialog(false);
        setShowCreateWalletDialog(false);
    }

    async function onWalletSelected(walletChoices) {
        setWalletChoices(walletChoices);
        //console.log('walletChoices: ', walletChoices);
        const selectedWallet = walletChoices.find(c=>c.selected);
        if(selectedWallet) {
            if(selectedWallet.label == "Phantom")
                twineContext.usePhantomWallet();
            else
                twineContext.useLocalWallet(selectedWallet.value.keypair);
        }        
    }

    async function loadKeys() {
        console.log('loading wallet choices...');
        const localWallets = await twineContext.getLocalWallets();
       
        //console.log('localWallets: ', localWallets);
        if(localWallets) {
            const populatedLocalWalletPromises = localWallets.map(async (w)=>{ 
                //console.log('w: ', w.keypair.publicKey.toBase58());
                w.lamports = await twineContext.getAccountLamports(w.keypair.publicKey);
                return w;            
            });
            
            const populatedLocalWallets = await Promise.all(populatedLocalWalletPromises);
            setLocalWalletKeys(populatedLocalWallets);
        }        
    }

    useEffect(()=>{
      
        let choices = [];
        choices.push(phantomWalletChoice);

        if(localWalletKeys) {
            
            const localWalletChoices = localWalletKeys.map(w => ({
                id: w.keypair.publicKey.toBase58(),
                label: w.name,
                description: "\nbalance:" + (w.lamports > 0 ?  w.lamports / web3.LAMPORTS_PER_SOL : 0)
                + "\nmax spend: " + w.maxSpend
                + "\naddress: " + w.keypair.publicKey.toBase58(),
                value: w,
                })
            );
            
            choices = choices.concat(localWalletChoices);
        }

        //console.log('choices: ', choices);
        setWalletChoices(choices);
    }, [localWalletKeys]);

   return (
    <ScrollView style={{alignContent: 'center',}}>
        <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
            <Dialog.Loading />
        </Dialog>
        <View style={{width: '90%', alignContent:'flex-start'}}>
            <RadioGroup 
                radioButtons={walletChoices} 
                onPress={onWalletSelected}
            />
        </View>

        <Button 
            type="solid"
            onPress={()=>setShowCreateWalletDialog(true)}            
            buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center' }}
        >
            <Icon name="add" color="white" size={30}/>
            Create Wallet
        </Button>

        <Dialog isVisible={showCreateWalletDialog}>
            <Dialog.Title title="Dialog Title"/>
            <Text>
                This will be a Twine wallet thats meant to hold small amounts to reduce the need for confirming every transaction.
            </Text>
            <Input
                placeholder='give the wallet a name'
                onChangeText={setWalletName}
            />
            <Input
                placeholder='max spend'
                keyboardType='decimal-pad'
                autoCapitalize='words'
                onChangeText={setWalletMaxSpend}
            />

            <Dialog.Actions>
                <Dialog.Button title="Create" onPress={() => createLocalWallet()}/>
                <Dialog.Button title="Cancel" onPress={() =>{setShowCreateWalletDialog(false); setWalletName('');}}/>
            </Dialog.Actions>
        </Dialog>
    </ScrollView>
   );
}


const styles = StyleSheet.create({

});