import * as Phantom from '../api/Phantom';
import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/solchat.json";
import type { Solchat } from '../target/types/solchat';
import * as web3 from "@solana/web3.js";
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'

import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
import { rejects } from 'assert';

const network = clusterApiUrl("devnet")
const connection = new Connection(network);
const programId = new PublicKey(idl.metadata.address);

export interface ContactProfile {
  description?: string;
  img?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  allows?: [string]; //use base58strings. serializing/deserialzing PublicKey has been giving issues
}

export interface WriteableContact {
    receiver?: PublicKey;
    name: string,
    data: ContactProfile,
}

export interface Contact extends WriteableContact {
  readonly address: PublicKey;
  readonly bump: number;  
  readonly creator: PublicKey;
}

export interface Allow {
  directMessage: true,
}

export interface DirectConversation {
  readonly address: PublicKey,
  readonly messages: [],
}

const getCurrentWalletPublicKey = () => Phantom.getWalletPublicKey();

export async function connectWallet(force=false, deeplinkRoute: string) {
  return new Promise<PublicKey>(async (resolve,reject) =>{
      Phantom
      .connect(force, deeplinkRoute)
      .then(()=>{
          resolve(getCurrentWalletPublicKey());
      })
      .catch(err=> reject(err));
  });
}

function getProgram(deeplinkRoute: string=""){
  const wallet = {
    signTransaction: (tx: Transaction) => Phantom.signTransaction(tx,false,true, deeplinkRoute),
    signAllTransactions: (txs: Transaction[]) => Phantom.signAllTransactions(txs,false,true,deeplinkRoute),
    publicKey: getCurrentWalletPublicKey(),
  };

  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  const program = new anchor.Program(idl as anchor.Idl, programId, provider) as anchor.Program<Solchat>;
  return program;  
}

function getContactPda(pubkey: PublicKey) {

    const [contactPda] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("contact"), 
        pubkey.toBuffer(),             
      ], programId);

    return contactPda;
}

function encodeData(data: any) {
  trimUndefined(data);
  const compressed = compress(data);
  const encoded = JSON.stringify(compressed);
  return encoded;
}

function decodeData(data: any) {
  const decoded = JSON.parse(data);
  const decompressed = decompress(decoded);
  return decompressed;
}

export function getContactByPubKey(key: PublicKey) {
  return new Promise<Contact>(async (resolve,reject)=>{
    if(!key) {
      reject('key must be specified');
      return;
    }

    const contactPda = getContactPda(key);

    if(!contactPda){
      reject('failed to generate contact PDA');
      return;
    }

    const contact = await getContactByPda(contactPda)
      .catch(reject);

    if(contact)
      resolve(contact);
    else
      reject('failed to get contact');
  });
}

export async function getContactByPda(contactPda: PublicKey) {  
  return new Promise<Contact>(async (resolve,reject) => {
    if(!contactPda) {
      reject('contactPda not specified');
      return;
    }
    const program = getProgram();
    const contact = await program.account.contact
      .fetchNullable(contactPda)
      .catch(reject);
    
    if(!contact)
      return;

    const contactData = decodeData(contact.data);
    resolve({...contact, data:contactData, address: contactPda});
  });
}

export async function getCurrentWalletContact() {
  return new Promise<Contact>(async(resolve,reject) => {
    const creatorPubkey = getCurrentWalletPublicKey();
    if(!creatorPubkey)
    {
      reject('not connected to a wallet');
      return;
    }
    const contact = await getContactByPubKey(creatorPubkey)
      .catch(reject);

    resolve(contact);
  });
}

export function getCurrentWalletContactPda() {
    const currentWalletPubkey = getCurrentWalletPublicKey()
    if(!currentWalletPubkey)
    {
      return;
    }
  
    const contactPda = getContactPda(currentWalletPubkey);
    return contactPda;
}

export async function addAllow(contactPda: PublicKey, allow: Allow, deeplinkRoute: string) {
  const promise = new Promise<Contact>(async (resolve,reject) =>{
    const contact = await getCurrentWalletContact(deeplinkRoute).catch(reject);
    const contactPdaString = contactPda.toBase58();

    if(!contact){
      reject('unable to current wallet contact');
      return;
    }

    if(!contact.data?.allows)
      contact.data.allows = [];


    if(contact.data?.allows?.includes(contactPdaString)) {
      const allowContact = await getContactByPda(contactPda);
      if(!allowContact) {
        reject('the specified key does not belong to a registered contact. Ask them to create a contact in the system');
      } else {
        reject('contact is already allowed');
      }
    }
    else{
      contact.data.allows.push(contactPdaString);
      const updatedContact = await updateContact(contact, deeplinkRoute).catch(reject);
      if(updatedContact)
        resolve(updatedContact);
      else
        reject("didn't receive an updated contact from updateContact()");
    }
  });

  return await promise;
}

export async function getContacts(contactPdas: Iterable<PublicKey>) {
  const program = getProgram();
  let promises = [];
  for(const contactPda of contactPdas) {
    promises.push(getContactByPda(contactPda));
  }

  const contacts = await Promise.all(promises)
  return contacts;
}

export async function getAllowedContacts(contact: Contact) : Promise<Contact[]> {
  const allows = contact?.data?.allows;
  if(allows) {
    const allowPdas = allows.map((a)=>new PublicKey(a));
    const contacts = await getContacts(allowPdas);
    return contacts;
  }

  return [];
}

export async function updateContact(contact: WriteableContact, deeplinkRoute: string) {
  return new Promise<Contact>(async (resolve,reject)=>{
    let errored = false;
    const creatorPubkey = getCurrentWalletPublicKey();
    if(!creatorPubkey){
      reject('not connected to a wallet');
      return;
    }

    const program = getProgram(deeplinkRoute);
    let contactPda= getContactPda(creatorPubkey);
    
    if(!contactPda) {
      reject('failed to create contact PDA');
      return;
    }

    const existingContact = await program.account.contact.fetchNullable(contactPda);
  
    const contactData = encodeData(contact.data);
    let tx = null;

    if(existingContact){
      console.log('updating contact...');
      tx = await program.methods
      .updateContact(contact.name, contactData, contact.receiver ?? creatorPubkey)
      .accounts({
        creator: creatorPubkey,
        contact: contactPda,
      })
      .transaction()
      .catch(reject);
    }
    else {      
      console.log('creating contact...');
      tx = await program.methods
        .createContact(contact.name, contactData, contact.receiver ?? creatorPubkey)
        .accounts({
          creator: creatorPubkey,
          contact: contactPda,
        })
        .transaction()
        .catch(reject);
    }

    if(!tx)  
      return;

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = creatorPubkey;  

    console.log('signing and sending transaction...');
    const signature = await Phantom
      .signAndSendTransaction(tx, false, true, deeplinkRoute) 
      .catch(reject);

    if(!signature)
      return;
  
    console.log('waiting for finalization...');
    const signatureResult = await connection
        .confirmTransaction(signature, 'finalized')
        .catch(reject); 
    
    if(!signatureResult)
        return;

    console.log('retrieving finalized data...');
    const latestContact = await getContactByPda(contactPda, deeplinkRoute)
      .catch(reject);
   
    if(latestContact) {
      console.log('got it! ', latestContact);
      resolve(latestContact);
      return;
    } 
    else {
      reject('failed to fetch contact data');
      return;
    }

  });
}

function getConversationPdas(contactA: PublicKey, contactB: PublicKey) {
  const contacts = [contactA, contactB];
  contacts.sort();

  const [directConversationPda, directConversationPdaBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("direct_conversation"), 
      contacts[0].toBuffer(),    
      contacts[1].toBuffer(),
    ], programId);

  return {
    conversation: directConversationPda,
    contact1: contacts[0],
    contact2: contacts[1],
  };
}

export async function sendDirectMessage(message: string, from: PublicKey, to: PublicKey, deeplinkRoute: string){
  return new Promise<string>(async (resolve,reject) => {
    const currentWalletKey = getCurrentWalletPublicKey();
    if(!currentWalletKey) {
      reject('not connected to a wallet');
      return;
    }

    if(!from) {
      reject('from contact must be specified');
      return;      
    }

    if(!to) {
      reject('to contact must be specified');
      return;
    }

    const conversationPdas = getConversationPdas(from, to);
    const program = getProgram(deeplinkRoute);
    
    let conversation = await program.account.directConversation.fetchNullable(conversationPdas.conversation);
    let tx = null;

    console.log('trying to send message: ', message);
    if(!conversation) {
      console.log('creating conversation');
      tx = await program.methods
        .startDirectConversation(message)
        .accounts({
          conversation: conversationPdas.conversation,
          payer: currentWalletKey,
          contact1: conversationPdas.contact1,
          contact2: conversationPdas.contact2,
        })
        .transaction()
        .catch(reject);
    }
    else {
      console.log('using existing conversation');
      tx = await program.methods
        .sendDirectMessage(message)
        .accounts({
          conversation: conversationPdas.conversation,
          payer: currentWalletKey,
          contact1: conversationPdas.contact1,
          contact2: conversationPdas.contact2,
        })
        .transaction()
        .catch(reject);
    }
    
    console.log('getting latest blockhash...');
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = currentWalletKey;  

    console.log('signing transaction...');
    const signature = await Phantom
      .signAndSendTransaction(tx, false, true, deeplinkRoute) 
      .catch(reject);
    
/*
    const signedTransaction = await Phantom.signTransaction(tx, false, true, deeplinkRoute)
      .catch(reject);

    if(!signedTransaction)
      return;

    console.log('sending transaction...', signedTransaction);
    const signature = await anchor.web3
      .sendAndConfirmRawTransaction(
        connection, 
        tx.serialize({ requireAllSignatures: false, verifySignatures: false }), 
        {skipPreflight: true, commitment:'confirmed'}
      )
      .catch(err=>{
        reject(JSON.stringify(err));
      });
*/
    console.log('signature: ', signature);
    if(!signature)
        return;

    if(signature)
      resolve(signature);
    else
      reject("didn't receive a signature");
    
  });
}

export async function getDirectMessages(contactA: PublicKey, contactB: PublicKey){
  return new Promise<DirectConversation>(async (resolve,reject) => {
    if(!contactA) {
      reject('contactA must be specified');
      return;      
    }

    if(!contactB) {
      reject('contactB must be specified');
      return;
    }

    const conversationPdas = getConversationPdas(contactA, contactB);
    const program = getProgram();    
    const conversation = await program.account.directConversation
      .fetchNullable(conversationPdas.conversation)
      .catch(err=>console.log(err));
    console.log('conversation: ', conversation);
    return {
      address: conversationPdas.conversation,
      messages: conversation?.messages ?? [],
    } as DirectConversation;
  });
}