import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from '../components/Themed';
//import * as Settings from '../reducers/settings'
import * as Phantom from '../api/Phantom';
import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
import * as st from "@solana/spl-token";
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/twine.json";
import type { Twine } from '../target/types/twine';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import {generateRandomString} from '../utils/random';

const SCREEN_DEEPLINK_ROUTE = "create_product";
const network = clusterApiUrl("devnet")
const connection = new Connection(network);  

export default function CreateProductScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [productData, setProductData] = useState(
    {
     name:'',
     description:'',
     cost: 0,
     sku: '',
    });
  const [logText, setLogText] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);
  const [productId, setProductId] = useState("");

  const log = useCallback((log: string, toConsole=true) => {
    toConsole && console.log(log);
    setLogText((logs) => [...logs, "> " + log])
  }, []);

  function getProgram(connection: Connection, pubkey: PublicKey){
    const wallet = {
      signTransaction: (tx: Transaction) => Phantom.signTransaction(tx,false,true,SCREEN_DEEPLINK_ROUTE),
      signAllTransactions: (txs: Transaction[]) => Phantom.signAllTransactions(txs,false,true,SCREEN_DEEPLINK_ROUTE),
      publicKey: pubkey
    };
  
    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    const program = new anchor.Program(idl as anchor.Idl, new PublicKey(idl.metadata.address), provider, null) as anchor.Program<Twine>;
    return program;  
  }


  async function createProduct() {
    setActivityIndicatorIsVisible(true);
    log('creating product...');
    const pubkey = Phantom.getWalletPublicKey();
    const program = getProgram(connection, pubkey);
    const productId = generateRandomString(12).toString();

    const [productPda, productPdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("product"),
        anchor.utils.bytes.utf8.encode(productId)
      ], program.programId);

    const product = await program.account.product.fetchNullable(productPda);
    if(product){
      log(`product already exists: ${productPda.toBase58()}`);
      setActivityIndicatorIsVisible(false);
      return;
    }       

    const mintKeypair = Keypair.generate(); 
    log(`creating product mint: ${mintKeypair.publicKey.toBase58()}`);

    const [productMintPda, productMintPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("product_mint"),
      mintKeypair.publicKey.toBuffer()
    ], program.programId);

    const [mintProductRefPda, mintProductRefPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("mint_product_ref"),
      mintKeypair.publicKey.toBuffer()
    ], program.programId);


    const productName = productData.name;
    const productDescription = productData.description;
    const productCost = new anchor.BN(productData.cost);
    const productSku = productData.sku;
    const productMintDecimals = 2;
    
    log(`creating product ${productPda.toBase58()}`);
    const tx = await program.methods
    .createProduct(productId, productMintDecimals, productName, productDescription, productCost, productSku,"")
    .accounts({
      mint: mintKeypair.publicKey,
      product: productPda,
      productMint: productMintPda,
      mintProductRef: mintProductRefPda,
      owner: pubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      twineProgram: program.programId,
    })
    .transaction()
    .catch(reason=>log(reason));;

    tx.feePayer = pubkey;  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.partialSign(mintKeypair)

    log('sending to Phantom for signing')
    const trans = await Phantom
    .signTransaction(tx, false, true, SCREEN_DEEPLINK_ROUTE) 
    .catch(error=>log(error));

    log('sending transaction...');
    const txid = await anchor.web3
      .sendAndConfirmRawTransaction(
        connection,
        trans.serialize({
            requireAllSignatures: true,
            verifySignatures: true,
        }),
        {skipPreflight: true}
      )
      .catch(err=>log(err));

    if(txid) {
      log('txid: ', txid);

      log(`waiting for confirmation on tx: ${txid}`)
      await connection.confirmTransaction(txid, 'finalized'); //wait for confirmation before retrieving account data
      
      log(`retreiving product data from ${productPda.toBase58()}`);
      const createdProduct = await program.account
                                  .product
                                  .fetchNullable(productPda)              
                                  .catch(error=>log(error));
      if(createdProduct){
        setProductId(productId);
        log('success');
      } else{
        log('failed to fetch product data');
      }

    } else{
      log('sending transaction failed.');
    }

    setActivityIndicatorIsVisible(false);
  }

  const readProduct = async () => {
    if(productId == ""){
      log('you must create a product first');
      return;
    }

    setActivityIndicatorIsVisible(true);
    log('reading product data');
    const pubkey = Phantom.getWalletPublicKey();
    const program = getProgram(connection, pubkey);
   
    const [productPda, productPdaBump] = PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("product"),
        anchor.utils.bytes.utf8.encode(productId)
      ], program.programId);

    const product = await program.account.product.fetchNullable(productPda);
    if(!product){
      log(`product doesn't exist: ${productPda.toBase58()}`);
      setActivityIndicatorIsVisible(false);
      return;
    }
    
    log(JSON.stringify(product));

    setProductData({
      name: product.name,
      description: product.description,
      cost: product.cost.toNumber(),
      sku: product.sku,
    });
                          
    log('done');
    setActivityIndicatorIsVisible(false);
  }

  const updateProduct = async()=>{
    if(productId == ""){
      log('you must create a product first');
      return;
    }

    setActivityIndicatorIsVisible(true);
    log('updating product data');
    const ownerPubKey = Phantom.getWalletPublicKey();
    const program = getProgram(connection, ownerPubKey);

    const [productPda, productPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("product"),
      anchor.utils.bytes.utf8.encode(productId)
    ], program.programId);

    const product = await program.account.product.fetchNullable(productPda);
    if(!product){
      log(`product doesn't exist: ${productPda.toBase58()}`);
      setActivityIndicatorIsVisible(false);
      return;
    }

    const tx = await program.methods
    .updateProduct(productData.name, productData.description, new anchor.BN(productData.cost), productData.sku,"")
    .accounts({
      product: productPda,
      owner: ownerPubKey,      
    })
    .transaction();

    tx.feePayer = ownerPubKey;  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const trans = await Phantom
      .signAndSendTransaction(tx, false, true, SCREEN_DEEPLINK_ROUTE)
      .catch(error=>log(error));

    log(`waiting for confirmation on tx: ${trans.signature}`)
    await connection.confirmTransaction(trans.signature, 'finalized'); //wait for confirmation before trying to retrieve account data

    const updatedProduct = await program.account.product.fetch(productPda);

    setProductData({
      name: updatedProduct.name,
      description: updatedProduct.description,
      cost: updatedProduct.cost.toNumber(),
      sku: updatedProduct.sku,
    });

    log('done');
    setActivityIndicatorIsVisible(false);    
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>      
      <View style={styles.body}>
        
        <TextInput placeholder='Name'
          style={{margin: 5}}
          value={productData.name}
          onChangeText={(t)=>setProductData({...productData,  name: t})}/>

        <TextInput placeholder='Description'
          style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}}        
          multiline={true}
          numberOfLines={4}
          value={productData.description}
          onChangeText={(t)=>setProductData({...productData,  description: t})}/>
        
        <TextInput placeholder='cost in lamports'
          value={productData.cost.toString()}
          keyboardType='numeric'
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}}
          onChangeText={(t)=>setProductData({...productData,  cost: +t})}/>
        
        <TextInput
          placeholder='SKU#'
          value={productData.sku}
          style={{borderStyle: 'solid', borderWidth: 1, margin: 5}} 
          onChangeText={(t)=>setProductData({...productData,  sku: t})}/>
      </View>
      <View> 
        <Button title='Create Product' onPress={createProduct} />
        <Button title='Read Product' onPress={readProduct} />
        <Button title='Update Product' onPress={updateProduct} />
      </View>

      <Text>This is will create a lone product(not associated to a store)</Text>
      
      <View style={{width: '95%', height: '35%', margin:5}}>
        <ScrollView
            contentContainerStyle={{
              backgroundColor: "#111",
              padding: 20,
              paddingTop: 100,
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
                  fontSize: 14,
                }}
              >
                {log}
              </Text>
            ))}
        </ScrollView>
      </View>
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1
  },
  title: {
    fontSize: 33,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  description: {
    fontSize: 17,
  },
  accountInfo: {
    width: '90%',
    height: 75,
  },
});
