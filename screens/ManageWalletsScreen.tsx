import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { View } from '../components/Themed';
import { Button, Dialog, Icon, Text, Input} from "@rneui/themed";
import { TwineContext, StoredLocalWallet } from '../components/TwineProvider';
import { useContext, useEffect, useState } from 'react';
//import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import RadioButtonRN from 'radio-buttons-react-native';
import { web3 } from '../dist/browser';
import { Avatar } from 'react-native-gifted-chat';
import { PressableIcon } from '../components/Pressables';
import * as Clipboard from 'expo-clipboard';


const phantomWalletChoice = {
    id:'Phantom',
    label: 'Phantom',
    description: 'This wallet will always be called for all transactions over max spend',
    value: 'Phantom',
    selected: true,
};

interface PopulatedStoredLocalWallet extends StoredLocalWallet {
    lamports: number
}

export default function ManageWalletsScreen(props) {
    const twineContext = useContext(TwineContext);
    const [localWallets, setLocalWallets] = useState<PopulatedStoredLocalWallet[]>();
    const [walletChoices, setWalletChoices] = useState([]);
    const [selectedWalletChoice, setSelectedWalletChoice] = useState();
    const [showCreateWalletDialog, setShowCreateWalletDialog] = useState(false);
    const [selectedWalletChoiceIndex, setSelectedWalletChoiceIndex] = useState(-1);
    const [walletName, setWalletName] = useState('');
    const [walletMaxSpend, setWalletMaxSpend] = useState<number>();
    const [createWalletName, setCreateWalletName] = useState('');
    const [createWalletMaxSpend, setCreateWalletMaxSpend] = useState(1);
    const [showLoadingDialog, setShowLoadingDialog] = useState(false);

    
    useEffect(()=>{
        if(!showCreateWalletDialog) {
            loadLocalWallets();
        }
    },[showCreateWalletDialog])
    
    async function createLocalWallet(){
        setShowLoadingDialog(true);
        const walletToCreate = {name: createWalletName, maxSpend: createWalletMaxSpend} as StoredLocalWallet;
        const createdWallet = await twineContext.createLocalWallet(walletToCreate);
        //console.log('createdWallet:', createdWallet);
        loadLocalWallets();
        setShowLoadingDialog(false);
        setShowCreateWalletDialog(false);
    }

    async function loadLocalWallets() {
        setShowLoadingDialog(true);
        console.log('loading local wallets...');
        const localWallets = await twineContext.getLocalWallets() as StoredLocalWallet[];
       
        //console.log('localWallets: ', localWallets);
        if(localWallets) {
            const populatedLocalWalletPromises = localWallets.map(async (w)=>{ 
                //console.log('w: ', w.keypair.publicKey.toBase58());
                const lamports = await twineContext.getAccountLamports(w.keypair.publicKey);
                return {...w, lamports} as PopulatedStoredLocalWallet;
            });
            
            const populatedLocalWallets = await Promise.all(populatedLocalWalletPromises);
            setLocalWallets(populatedLocalWallets);
        } else{
            setLocalWallets(localWallets);
        }

        setShowLoadingDialog(false);
    }

    useEffect(()=>{
        if(!localWallets)
            return;

        console.log('creating choices...');
        let selectedChoice = phantomWalletChoice;
        let selectedIndex = 1;

        if(localWallets && localWallets.length > 0) {
            let index = 1;
            const localWalletChoices = localWallets.map(w => {
                index++;

                const choice = {
                    id: w.keypair.publicKey.toBase58(),
                    label: w.name,
                    value: w,
                    selected: w.isDefault,
                };

                if(w.isDefault) {
                    console.log('selected choice: ', choice.label);
                    selectedChoice = choice;
                    selectedIndex = index;
                }

                return choice;
            });
                
            const choices = [{...phantomWalletChoice, selected: selectedIndex == 1}, ...localWalletChoices];
            //console.log('choices: ', choices);
            console.log('looks like its localwallet');
            setWalletChoices(choices);
            setSelectedWalletChoice(selectedChoice);
            setSelectedWalletChoiceIndex(selectedIndex);
            setWalletName(selectedChoice?.label);
            setWalletMaxSpend(selectedChoice?.value?.maxSpend ?? 0);
        }
        else {
            console.log("looks like it's phantom")
            setWalletChoices([phantomWalletChoice]);
            setSelectedWalletChoice(phantomWalletChoice);
            setSelectedWalletChoiceIndex(selectedIndex);
            setWalletName(phantomWalletChoice.label);
            setWalletMaxSpend(0);
        }

    }, [localWallets]);


    useEffect(()=>{
        if(!selectedWalletChoice)
            return;

        console.log('setting wallet choice: ', selectedWalletChoice.label);
        if(selectedWalletChoice) {
            if(selectedWalletChoice.label == "Phantom")
                twineContext.usePhantomWallet();
            else
                twineContext.useLocalWallet(selectedWalletChoice.value);
        } 
    },[selectedWalletChoice]);

    async function walletChoiceSelected(choice) {
        setSelectedWalletChoice(choice);
        setWalletName(choice?.label);
        setWalletMaxSpend(choice?.value?.maxSpend);
    }


    async function updateSelectedWallet() {
        setShowLoadingDialog(true);
        
        const walletChange = {...selectedWalletChoice.value, name: walletName, maxSpend: walletMaxSpend};
        const updatedWallet = await twineContext
            .updateLocalWallet(walletChange)
            .catch(err=>Alert.alert('error', err));
        
        await loadLocalWallets();

        setShowLoadingDialog(false);
    }


   return (
    <ScrollView style={{alignContent: 'center',}}>
        <Dialog isVisible={showLoadingDialog} overlayStyle={{backgroundColor:'transparent', shadowColor: 'transparent'}}>
            <Dialog.Loading />
        </Dialog>
        <Button 
            type="solid"
            onPress={()=>setShowCreateWalletDialog(true)}            
            buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
        >
            <Icon name="add" color="white" size={30}/>
            Create New Wallet
        </Button>

        <ScrollView style={{width: '90%', height: '50%', alignContent:'center'}} contentContainerStyle={{justifyContent: 'center'}}>
            <RadioButtonRN
                data={walletChoices}
                selectedBtn={(e) => walletChoiceSelected(e)}
                icon={
                    <Icon name="check-circle" size={25} color="#2c9dd1" />
                }
                animationTypes={['pulse']}
                initial={selectedWalletChoiceIndex}
            />
        </ScrollView>

        <View style={styles.inputSection}>
            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Name:</Text>
                <TextInput 
                    style={styles.inputBox}
                    value={walletName}
                    editable={selectedWalletChoice?.label != "Phantom" }
                    onChangeText={setWalletName}
                />
            </View>

            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Max Spend: (SOL)</Text>
                <TextInput 
                    style={styles.inputBox}
                    value={walletMaxSpend?.toString()}
                    keyboardType='decimal-pad'
                    autoCapitalize='words'
                    editable={selectedWalletChoice?.label != "Phantom" }
                    onChangeText={(t)=>setWalletMaxSpend(t)}                    
                />
            </View>

            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Balance: (SOL)</Text>
                <Text style={styles.textBox}>{(selectedWalletChoice?.value?.lamports ?? 0) / web3.LAMPORTS_PER_SOL}</Text>
            </View>

            <View style={styles.inputRow}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.inputLabel}>Address:</Text>
                    <PressableIcon
                        name="copy"
                        size={20}
                        onPress={() =>Clipboard.setString(selectedWalletChoice?.value?.keypair?.publicKey?.toBase58())}
                        style={{marginLeft: 5}}
                    />
                </View>
                <Text style={styles.textBox}>{selectedWalletChoice?.value?.keypair?.publicKey?.toBase58()}</Text>
            </View>

            <Button 
                type="solid"
                onPress={()=>updateSelectedWallet()}            
                buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginVertical: 20 }}
                disabled={selectedWalletChoice?.label == "Phantom"}
            >
                Save
            </Button>
        </View>

 

        <Dialog isVisible={showCreateWalletDialog}>
            <Dialog.Title title="Dialog Title"/>
            <Text>
                This will be a Twine wallet thats meant to hold small amounts to reduce the need for confirming every transaction.
            </Text>
         
            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Wallet Name:</Text>
                <TextInput
                    value={createWalletName}
                    placeholder='give the wallet a name'
                    style={styles.inputBox}
                    onChangeText={(t)=>setCreateWalletName(t)}
                />
            </View>
            
            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Max Spend: (SOL)</Text>
                <TextInput 
                    style={styles.inputBox}
                    value={walletMaxSpend?.toString()}
                    keyboardType='decimal-pad'
                    autoCapitalize='words'
                    onChangeText={(t)=>setCreateWalletMaxSpend(t)}                    
                />
            </View>
            

            <Dialog.Actions>
                <Dialog.Button title="Create" onPress={() => createLocalWallet()}/>
                <Dialog.Button title="Cancel" onPress={() =>{setShowCreateWalletDialog(false); setCreateWalletName(''); setCreateWalletMaxSpend(0);}}/>
            </Dialog.Actions>
        </Dialog>
    </ScrollView>
   );
}


const styles = StyleSheet.create({
    inputSection: {
        flex: 1,
        alignContent: 'flex-start',
        padding: 10,
        marginTop: 10,
        borderWidth: 2,
        backgroundColor: '#DDDDDD',
        width:'95%',
        alignSelf: 'center',
        borderRadius: 20,
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
      },
      textBox: {
        borderWidth: 0,
        alignContent: 'flex-start',
        height: 40,
        marginBottom: 10,
      },
      inputRow:{
        margin: 5,
      },
});