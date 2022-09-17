import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { View } from '../components/Themed';
import { Button, Dialog, Icon, Text, Input} from "@rneui/themed";
import { TwineContext, StoredLocalWallet } from '../components/TwineProvider';
import { useContext, useEffect, useState } from 'react';
//import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import RadioButtonRN from 'radio-buttons-react-native';
import { web3 } from '../dist/browser';
import { PressableIcon } from '../components/Pressables';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import {Mint} from '../constants/Mints';
import SelectDropdown from 'react-native-select-dropdown';
import { AssetType } from '../api/Twine';
import { PublicKey } from '@solana/web3.js';


const SCREEN_DEEPLINK_ROUTE = "manage_wallets";

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

interface SendAsset {
    type: AssetType;
    amount: number;
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
    const [showSwapDialog, setShowSwapDialog] = useState(false);
    const [swapFrom, setSwapFrom] = useState(Mint.SOL);
    const [swapTo, setSwapTo] = useState(Mint.USDC);
    const [swapAmount, setSwapAmount] = useState();
    const [swapMessage, setSwapMessage] = useState('');
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [sendDialogMessage, setSendDialogMessage] = useState('');
    const [sendToAddress, setSendToAddress] = useState('');
    const [sendAsset, setSendAsset] = useState<SendAsset>({type: AssetType.SOL, amount:0});
    
    useEffect(()=>{
        if(!showCreateWalletDialog) {
            loadLocalWallets();
        }
    },[showCreateWalletDialog])
    
    async function createLocalWallet(){
        setShowLoadingDialog(false);
        const walletToCreate = {name: createWalletName, maxSpend: createWalletMaxSpend} as StoredLocalWallet;
        const createdWallet = await twineContext.createLocalWallet(walletToCreate);
        //console.log('createdWallet:', createdWallet);
        loadLocalWallets();
        setShowLoadingDialog(false);
        setShowCreateWalletDialog(false);
    }

    async function loadLocalWallets() {
        setShowLoadingDialog(false);
        console.log('loading local wallets...');
        const localWallets = await twineContext.getLocalWallets() as StoredLocalWallet[];
       
        //console.log('localWallets: ', localWallets);
        if(localWallets) {
            const populatedLocalWalletPromises = localWallets.map(async (w)=>{ 
                //console.log('w: ', w.keypair.publicKey.toBase58());
                const solBalancePromise = twineContext.getAccountSol(w.keypair.publicKey);
                const usdcBalancePromise = twineContext.getTokenBalance(Mint.USDC, w.keypair.publicKey);
                const shdwBalancePromise = twineContext.getTokenBalance(Mint.SHDW, w.keypair.publicKey);
                const [sol, usdc, shdw] = await Promise.all([solBalancePromise, usdcBalancePromise, shdwBalancePromise]);
                return {...w, sol, usdc, shdw} as PopulatedStoredLocalWallet;
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
        setShowLoadingDialog(false);
        
        const walletChange = {...selectedWalletChoice.value, name: walletName, maxSpend: walletMaxSpend};
        const updatedWallet = await twineContext
            .updateLocalWallet(walletChange)
            .catch(err=>Alert.alert('error', err));
        
        await loadLocalWallets();

        setShowLoadingDialog(false);
    }

    async function displaySwapDialog() {
        setSwapAmount(null);
        setSwapFrom(Mint.SOL);
        setSwapTo(Mint.USDC);
        setSwapMessage('');
        setShowSwapDialog(true);
    }

    async function setSwapAmountChecked(n) {
        setSwapMessage('');

        switch(swapFrom?.name){            
            case 'SOL':
                if(n > selectedWalletChoice?.value?.sol)
                    setSwapMessage("you don't have enough SOL");
                else
                    setSwapAmount(n);
                break;
            case 'USDC':
                if(n > selectedWalletChoice?.value?.usdc)
                    setSwapMessage("you don't have enough USDC");
                else
                    setSwapAmount(n);
                break;
            case 'SHDW':
                if(n > selectedWalletChoice?.value?.shdw)
                    setSwapMessage("you don't have enough SHDW");
                else
                    setSwapAmount(n);
                break;
            default:
                setSwapMessage('unknown swap type');
                break;
        }
    }

    async function swap() {
        if(swapAmount <= 0) {
            setSwapMessage('amount must be greater than 0');
        }

        setShowSwapDialog(false);
        setShowLoadingDialog(true);
        const swapTransactionSignature = await twineContext.tokenSwapper.swap(swapFrom, swapAmount, 1, swapTo, SCREEN_DEEPLINK_ROUTE);
        console.log('swapTransactionSignature: ', swapTransactionSignature);
        loadLocalWallets();
    }

    async function displaySendDialog() {
        setSendToAddress('');
        setSendAsset({type: AssetType.SOL, amount:0});
        setSendDialogMessage('');
        setShowSendDialog(true);
    }

    async function sendAssetToAddress(){
        if(!sendToAddress)
          return;
    
        console.log('sending= type: ', sendAsset.type, ', amount: ', sendAsset.amount);
    
        if(sendAsset.amount <= 0)
        {
          setSendDialogMessage('an amount must be specified');
          return;
        }
    
        setShowSendDialog(false);
        setShowLoadingDialog(true);
    
        const signature = await twineContext
          .sendAsset(sendAsset.type, new PublicKey(sendToAddress), sendAsset.amount, SCREEN_DEEPLINK_ROUTE)
          .catch(err=>{
            console.log(err);
          });
        
        
        setShowSendDialog(false);
        loadLocalWallets();
        setShowLoadingDialog(false);
    }
    
    async function cancelSendAssetToAddress() {
        setShowSendDialog(false);
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
                <Text style={styles.inputLabel}>Balance:</Text>
                <View style={{flexDirection: 'column', marginBottom:5,}}>          
                    <Text>USDC: {(selectedWalletChoice?.value?.usdc ?? 0)}</Text>
                    <Text>SOL: {(selectedWalletChoice?.value?.sol ?? 0)}</Text>
                    <Text>SHDW: {(selectedWalletChoice?.value?.shdw ?? 0)}</Text>
                </View>
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
                    <Text style={{fontSize: 10}}>{selectedWalletChoice?.value?.keypair?.publicKey?.toBase58()}</Text>   
                                 
                </View>                   
                
                {selectedWalletChoice?.value?.keypair?.publicKey &&
                    <QRCode value={selectedWalletChoice?.value?.keypair?.publicKey?.toBase58()} size={50} />
                }                
            </View>


            <View style={{flexDirection: 'row', alignSelf:'center', backgroundColor: 'transparent', justifyContent: 'space-evenly', paddingHorizontal: 20,}}>
                <Button 
                    type="solid"
                    onPress={()=>updateSelectedWallet()}            
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '70%', height: 50, alignSelf:'center', marginVertical: 20 }}
                    disabled={selectedWalletChoice?.label == "Phantom"}
                >
                    Save
                </Button>

                <Button 
                    type="solid"
                    onPress={()=>displaySwapDialog()}            
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '70%', height: 50, alignSelf:'center', marginVertical: 20 }}
                    disabled={selectedWalletChoice?.label == "Phantom"}
                >
                     <Icon type="ionicon" name="swap-horizontal-outline"/>
                    Swap
                </Button>

                <Button 
                    type="solid"
                    onPress={()=>displaySendDialog()}            
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '70%', height: 50, alignSelf:'center', marginVertical: 20 }}
                    disabled={selectedWalletChoice?.label == "Phantom"}
                >
                    <Icon type="ionicon" name="send-outline"/>
                    Send
                </Button>
            </View>
        </View>

 

        <Dialog isVisible={showCreateWalletDialog}>
            <Dialog.Title title="Dialog Title"/>
            <Text>
                This will be a local "burner" wallet thats meant to hold small amounts to reduce the need for confirming every transaction.
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

        <Dialog isVisible={showSwapDialog}>
            <Text> {swapMessage}</Text>              
            
            <View style={{flexDirection: 'row', justifyContent: 'center', alignContent:'center', marginVertical: 20}}>
                <Text style={{fontWeight: 'bold'}}>{swapFrom?.name}</Text>        
                    <Icon 
                        type="ionicon" 
                        name="swap-horizontal-outline" 
                        size={30}
                        style={{marginHorizontal: 20}}
                        onPress={()=>{const from=swapFrom; setSwapFrom(swapTo); setSwapTo(from);}}
                    />                   
                <Text style={{fontWeight: 'bold'}}>{swapTo?.name}</Text>                
            </View>

            <TextInput
                placeholder='amount'
                style={styles.inputBox}
                value={swapAmount?.toString()}
                keyboardType='decimal-pad'
                autoCapitalize='words'
                onChangeText={(t)=>setSwapAmountChecked(t)}
            />

            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Dialog.Button 
                    type="solid"
                    onPress={()=>swap()}            
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginTop: 10 }}
                >
                    Swap
                </Dialog.Button>

                <Dialog.Button 
                    type="solid"
                    onPress={()=>setShowSwapDialog(false)}            
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, alignSelf:'center', marginTop: 10 }}
                >
                    Cancel
                </Dialog.Button>
            </View>
        </Dialog>

        <Dialog isVisible={showSendDialog}>
            <Text style={{color: 'red', fontStyle: 'italic'}}>{sendDialogMessage}</Text>
            <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Send To Address:</Text>
                <TextInput 
                    style={styles.inputBox}
                    value={sendToAddress}
                    onChangeText={setSendToAddress}
                />
            </View>
        
            <SelectDropdown 
                data={Object.keys(AssetType).filter(v=>isNaN(Number(v)))}
                onSelect={(val,index)=>{ 
                    setSendAsset({...sendAsset, type: AssetType[val]});
                }}
                buttonStyle={{margin: 5, alignSelf: 'center'}}
                defaultValue={"SOL"}
            />
            <TextInput 
                placeholder="amount to send" 
                value={sendAsset.amount?.toString()}
                style={styles.inputBox} 
                keyboardType='decimal-pad'
                autoCapitalize='words'
                onChangeText={(value) => setSendAsset({
                    ...sendAsset,
                    amount: value
                })
                }
            />

            <View style={{flexDirection: 'row', width: '100%', alignContent: 'center', alignSelf: 'center', justifyContent: 'space-evenly'}}>
                <Dialog.Button 
                    type="solid"                                
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, marginTop: 10 }}
                    onPress={sendAssetToAddress}
                >
                    Send
                </Dialog.Button>
                <Dialog.Button 
                    type="solid"                                
                    buttonStyle={{ borderWidth: 0, borderRadius: 8, width: '90%', height: 50, marginTop: 10 }}
                    onPress={cancelSendAssetToAddress}
                >
                    Cancel
                </Dialog.Button>
               
            </View>
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