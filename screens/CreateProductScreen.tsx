import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
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

const twine_program = new PublicKey("GMfD6UaH9SCYv6xoT7Jb7X14L2TSQaJbtLGpdzU4f88P");


export default function CreateProductScreen() {
  const [state, updateState] = useState('')
  const settings = useSelector(state => state);
  const dispatch = useDispatch();
  const [activityIndicatorIsVisible, setActivityIndicatorIsVisible] = useState(false);
  const [productData, updateProductData] = useState(
    {
     name:'',
     description:'',
     cost: 0,
     sku: '',
    });

  function getProgram(connection: Connection, pubkey: PublicKey){
    const wallet = {
      signTransaction: Phantom.signTransaction,
      signAllTransactions: Phantom.signAllTransactions,
      publicKey: pubkey
    };
  
    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    const program = new anchor.Program(idl as anchor.Idl, twine_program, provider) as anchor.Program<Twine>;
    return program;  
  }


  async function createProduct() {
    setActivityIndicatorIsVisible(true);
    console.log('creating product...');
    const pubkey = Phantom.getWalletPublicKey();
    const network = clusterApiUrl("devnet")
    const connection = new Connection(network);  
    const program = getProgram(connection, pubkey);

    const [companyPda, companyPdaBump] = PublicKey
    .findProgramAddressSync([anchor.utils.bytes.utf8.encode("company"), pubkey.toBuffer()], program.programId);
    
    const [storePda, storePdaBump] = PublicKey
      .findProgramAddressSync([
          anchor.utils.bytes.utf8.encode("store"),
          pubkey.toBuffer(),
          companyPda.toBuffer(),
          new Uint8Array([0,0,0,0])], program.programId);
  
    const [productPda, productPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("product"),
      pubkey.toBuffer(),
      storePda.toBuffer(),
      new Uint8Array([0,0,0,0,0,0,0,0])], program.programId);

    const productInfo = await connection.getAccountInfo(productPda);
    if(productInfo){
      console.log('product already exists');
      setActivityIndicatorIsVisible(false);
      return;
    }
        
    console.log('creating mint');
    const authorityKeypair = Keypair.generate();
    const mintKeypair = Keypair.generate();
    console.log('funding ', authorityKeypair.publicKey.toBase58());
    const airDropSig = await connection.requestAirdrop(authorityKeypair.publicKey, 100000000);
    await connection.confirmTransaction(airDropSig);

    const mint = await st.createMint(
      connection,
      authorityKeypair,
      pubkey,
      null,
      0,
      mintKeypair,
      null,
      TOKEN_PROGRAM_ID
    ) as PublicKey;

    const [productMintPda, productMintPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("product_mint"),
      mint.toBuffer()
    ], program.programId);

    const [mintProductRefPda, mintProductRefPdaBump] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("mint_product_ref"),
      mint.toBuffer()
    ], program.programId);

    const storeNumber = 0;
    const productName = productData.name;
    const productDescription = productData.description;
    const productCost = productData.cost;
    const productSku = productData.sku;
    
    console.log('creating product');
    const tx = await program.methods
    .createProduct(storeNumber, productName, productDescription, productCost, productSku)
    .accounts({
      mint: mint,
      product: productPda,
      productMint: productMintPda,
      mintProductRef: mintProductRefPda,
      store: storePda,
      company: companyPda,
      owner: pubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program.programId,      
    })
    .transaction()
    .catch(reason=>console.log(reason));;

    tx.feePayer = pubkey;  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const trans = await Phantom
    .signAndSendTransaction(tx, false) 
    .catch(error=>console.log(error));

    await connection.confirmTransaction(trans.signature); //wait for confirmation before retrieving account data
    
    const createdProduct = await program.account
                                .product
                                .fetch(productPda)
                                .catch(error=>console.log(error));

    console.log('done');
    setActivityIndicatorIsVisible(false);
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={activityIndicatorIsVisible} size="large"/>      
      <View style={styles.body}>
        <TextInput placeholder='Name' style={{margin: 5}}/>
        <TextInput style={{width: 250, borderStyle: 'solid', borderColor: 'black', borderWidth: 1, margin: 5}} 
        placeholder='Description'
        multiline={true}
        numberOfLines={4}/>
        <TextInput placeholder='cost in lamports' style={{borderStyle: 'solid', borderWidth: 1, margin: 5}} />
        <TextInput placeholder='SKU#' style={{borderStyle: 'solid', borderWidth: 1, margin: 5}} />
      </View>
      <View style={styles.container}> 
        <Button title='Create Product' onPress={createProduct} />
      </View>

      <Text>This is here for testing. Go to the create store screen first to connect to wallet, create company, and create store, before creating a product here.</Text>
      
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
