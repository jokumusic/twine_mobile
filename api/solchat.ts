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

const network = clusterApiUrl("devnet")
const connection = new Connection(network);
const programId = new PublicKey(idl.metadata.address);

export interface ContactProfile {
  description?: string;
  img?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  allows?: Map<PublicKey,Allow>;
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

function getProgram(deeplinkRoute: string){
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
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("contact"), 
      pubkey.toBuffer(),             
    ], programId);
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

export async function getContactByPubKey(key: PublicKey, deeplinkRoute: string) {
  const [contactPda, contactAPdaBump] = await getContactPda(key);
  return await getContactByPda(contactPda, deeplinkRoute);  
}

export async function getContactByPda(contactPda: PublicKey, deeplinkRoute: string) {
  const program = getProgram(deeplinkRoute);
  const contact = await program.account.contact.fetchNullable(contactPda);
  if(!contact)
    return null;

  const contactData = decodeData(contact.data);

  return {...contact, data:contactData, address: contactPda};
}

export async function getCurrentWalletContact(deeplinkRoute: string) {
  const creatorPubkey = getCurrentWalletPublicKey();
  return await getContactByPubKey(creatorPubkey, deeplinkRoute);
}

export function getCurrentWalletContactPda() {
  return getContactPda(getCurrentWalletPublicKey())
}

export async function addAllow(key: PublicKey, allow: Allow, deeplinkRoute: string) {
  const promise = new Promise<Contact>(async (resolve,reject) =>{
    const contact = await getCurrentWalletContact(deeplinkRoute);

    if(!contact.data.allows) 
      contact.data.allows = new Map<PublicKey, Allow>();

    if(!contact.data.allows.has(key)) {
      const allowContact = await getContactByPubKey(key, deeplinkRoute);
      if(!allowContact) {
        reject('the specified key does not belong to a registered contact. Ask them to create a contact in the system');
      }

      contact.data.allows.set(key, allow);
    }
    else{
      contact.data.allows.set(key,allow);
    }
  });

  return await promise;
}

export async function getContacts(keys: PublicKey[]) {

}


export async function updateContact(contact: WriteableContact, deeplinkRoute: string) {
  const promise = new Promise<Contact>(async (resolve,reject)=>{
    const creatorPubkey = getCurrentWalletPublicKey();  
    const program = getProgram(deeplinkRoute);
    let [contactPda, contactPdaBump] = getContactPda(creatorPubkey);
    const existingContact = await program.account.contact.fetchNullable(contactPda);
    const contactData = encodeData(contact.data);
    console.log(contact.data);
    let errored=false;
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
      .catch(err=>{errored=true; reject(err); });
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
        .catch(err=>{errored=true; reject(err); });
    }

    if(errored)  
      return;

    console.log('getting latest blockhash...');
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = creatorPubkey;  
  
    console.log('signing and sending transaction...');
    const trans = await Phantom
      .signAndSendTransaction(tx, false, true, deeplinkRoute) 
      .catch(err=>{errored=true; reject(err);});

    if(errored)
      return;
  
    console.log('waiting for finalization...');
    await connection
        .confirmTransaction(trans.signature, 'finalized')
        .catch(err=>{errored=true; reject(err);}); 
    
    if(errored)
        return;

    console.log('retrieving finalized data...');
    const latestContact = getContactByPda(contactPda)
      .catch(err=>{errored=true; reject(err);});
   
    if(latestContact) {
      console.log('got it!');
      resolve(latestContact);
      return;
    } 
    else {
      reject('failed to fetch contact data');
      return;
    }

  });

  return await promise;
}