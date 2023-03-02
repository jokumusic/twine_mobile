import * as anchor from "../dist/browser/index";
import * as idl from "../target/idl/solchat.json";
import type { Solchat as SolchatProgram } from '../target/types/solchat';
import * as web3 from "@solana/web3.js";
import { compress, decompress, trimUndefined, trimUndefinedRecursively } from 'compress-json'

import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
import WalletInterface from "./WalletInterface";
import { rejects } from "assert";

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
  directMessage: true;
}

export interface DirectConversation {
  readonly address: PublicKey;
  readonly contact1: PublicKey;
  readonly contact2: PublicKey;
  readonly messages: [];
}

export interface WriteableGroup {
  owner: PublicKey;
  name: string;
  data: string;
}

export interface Group extends WriteableGroup {
  readonly address: PublicKey;
  readonly bump: number;
  readonly nonce: number;  
}

export interface WriteableGroupContact {
  groupContactRole: number;
  groupContactPreference: number;
}

export interface GroupContact extends WriteableGroupContact {
  readonly address: PublicKey;
  readonly bump: number;
  readonly group: PublicKey;
  readonly contact: PublicKey;
}

export enum GroupContactRole {
  Ignore = 0,
  Read = 1,
  Write = 2,
  Admin = 4,
}

export enum GroupContactPreference {
  Ignore = 0,
  Subscribe = 1,
}


export class SolChat {
  private solChatAccountChangeCallbackHandlers = new Map<string,any>();
  private wallet;
  private connection;
  private programId = new PublicKey(idl.metadata.address);

  constructor(connection: Connection, wallet?: WalletInterface){
    if(!connection)
      throw new Error("connection must be specified")

    this.wallet = wallet;
    this.connection = connection;
  }

  setWallet(wallet: WalletInterface) {
   this.wallet = wallet;
  }
  
  getCurrentWalletPublicKey = () => this.wallet?.getWalletPublicKey();

  async connectWallet(force=false, deeplinkRoute: string) {
    return new Promise<PublicKey>(async (resolve,reject) =>{
        this.wallet
        .connect(force, deeplinkRoute)
        .then(()=>{
            resolve(this.getCurrentWalletPublicKey());
        })
        .catch(err=> reject(err));
    });
  }

  private getProgram(deeplinkRoute: string=""){
    const wallet = {
      signTransaction: (tx: Transaction) => this.wallet.signTransaction(tx,false,true, deeplinkRoute),
      signAllTransactions: (txs: Transaction[]) => this.wallet.signAllTransactions(txs,false,true,deeplinkRoute),
      publicKey: this.getCurrentWalletPublicKey(),
    };

    const provider = new anchor.AnchorProvider(this.connection, wallet, anchor.AnchorProvider.defaultOptions());
    const program = new anchor.Program(idl as anchor.Idl, this.programId, provider) as anchor.Program<SolchatProgram>;
    return program;  
  }

  private getContactPda(pubkey: PublicKey) {
      const [contactPda] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("contact"), 
          pubkey.toBuffer(),             
        ], this.programId);

      return contactPda;
  }

  private encodeData(data: any) {
    trimUndefined(data);
    const compressed = compress(data);
    const encoded = JSON.stringify(compressed);
    return encoded;
  }

  private decodeData(data: any) {
    const decoded = JSON.parse(data);
    const decompressed = decompress(decoded);
    return decompressed;
  }

  getContactByWalletPubkey(key: PublicKey) {
    return new Promise<Contact>(async (resolve,reject)=>{
      if(!key) {
        reject('key must be specified');
        return;
      }

      const contactPda = this.getContactPda(key);

      if(!contactPda){
        reject('failed to generate contact PDA');
        return;
      }

      const contact = await this.getContactByPda(contactPda)
        .catch(reject);

      if(contact)
        resolve(contact);
      else
        reject('failed to get contact');
    });
  }

  async getContactByPda(contactPda: PublicKey) {  
    return new Promise<Contact>(async (resolve,reject) => {
      if(!contactPda) {
        reject('contactPda not specified');
        return;
      }
      const program = this.getProgram();
      const contact = await program.account.contact
        .fetchNullable(contactPda)
        .catch(reject);
      
      if(!contact)
        return;

      const contactData = this.decodeData(contact.data);
      resolve({...contact, data:contactData, address: contactPda});
    });
  }

  async getCurrentWalletContact() {
    return new Promise<Contact>(async(resolve,reject) => {
      const creatorPubkey = this.getCurrentWalletPublicKey();
      if(!creatorPubkey)
      {
        reject('not connected to a wallet');
        return;
      }
      const contact = await this.getContactByWalletPubkey(creatorPubkey)
        .catch(reject);

      if(contact)
        resolve(contact);
      else
        reject("unable to retreive contact");
    });
  }

  getCurrentWalletContactPda() {
      const currentWalletPubkey = this.getCurrentWalletPublicKey()
      if(!currentWalletPubkey)      
        return;
    
      const contactPda = this.getContactPda(currentWalletPubkey);
      return contactPda;
  }


  async addAllowByWalletAddress(walletAddress: PublicKey, allow: Allow, deeplinkRoute: string) {
    const contactPda = this.getContactPda(walletAddress);
    return this.addAllow(contactPda, allow, deeplinkRoute);
  }

  async addAllow(contactPda: PublicKey, allow: Allow, deeplinkRoute: string) {
    const promise = new Promise<Contact>(async (resolve,reject) =>{
      const contact = await this.getCurrentWalletContact().catch(reject);
      const contactPdaString = contactPda.toBase58();

      if(!contact){
        reject('unable to current wallet contact');
        return;
      }

      if(!contact.data?.allows)
        contact.data.allows = [];


      if(contact.data?.allows?.includes(contactPdaString)) {
        const allowContact = await this.getContactByPda(contactPda);
        if(!allowContact) {
          reject('the specified key does not belong to a registered contact. Ask them to create a contact in the system');
        } else {
          reject('contact is already allowed');
        }
      }
      else{
        contact.data.allows.push(contactPdaString);
        const updatedContact = await this.updateContact(contact, deeplinkRoute).catch(reject);
        if(updatedContact)
          resolve(updatedContact);
        else
          reject("didn't receive an updated contact from updateContact()");
      }
    });

    return await promise;
  }

  async getContacts(contactPdas: Iterable<PublicKey>) {
    const program = this.getProgram();
    let promises = [];
    for(const contactPda of contactPdas) {
      promises.push(this.getContactByPda(contactPda));
    }

    const contacts = await Promise.all(promises)
    return contacts;
  }

  async getAllowedContacts(contact: Contact) : Promise<Contact[]> {
    const allows = contact?.data?.allows;
    if(allows) {
      const allowPdas = allows.map((a)=>new PublicKey(a));
      const contacts = await this.getContacts(allowPdas);
      return contacts;
    }

    return [];
  }

  async updateContact(contact: WriteableContact, deeplinkRoute: string) {
    return new Promise<Contact>(async (resolve,reject)=>{      
      const creatorPubkey = this.getCurrentWalletPublicKey();
      if(!creatorPubkey){
        reject('not connected to a wallet');
        return;
      }

      const program = this.getProgram(deeplinkRoute);
      let contactPda= this.getContactPda(creatorPubkey);
      
      if(!contactPda) {
        reject('failed to create contact PDA');
        return;
      }

      const existingContact = await program.account.contact.fetchNullable(contactPda);
    
      const contactData = this.encodeData(contact.data);
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

      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = creatorPubkey;  

      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);

      if(!signature)
        return;
    
      console.log('waiting for finalization...');
      const signatureResult = await this.connection
          .confirmTransaction(signature, 'finalized')
          .catch(reject); 
      
      if(!signatureResult)
          return;

      console.log('retrieving finalized data...');
      const latestContact = await this.getContactByPda(contactPda, deeplinkRoute)
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

  private getConversationPdas(contactA: PublicKey, contactB: PublicKey) {
    const contacts = [contactA, contactB];
    contacts.sort();

    const [directConversationPda, directConversationPdaBump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("direct_conversation"), 
        contacts[0].toBuffer(),    
        contacts[1].toBuffer(),
      ], this.programId);

    return {
      conversation: directConversationPda,
      contact1: contacts[0],
      contact2: contacts[1],
    };
  }

  async sendDirectMessage(message: string, from: PublicKey, to: PublicKey, deeplinkRoute: string){
    return new Promise<string>(async (resolve,reject) => {
      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }

      if(!from) {
        reject('"from" contact must be specified');
        return;      
      }

      if(!to) {
        reject('"to" contact must be specified');
        return;
      }

      const conversationPdas = this.getConversationPdas(from, to);
      const program = this.getProgram(deeplinkRoute);
      
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

      //console.log(`sending contact1: ${conversationPdas.contact1.toBase58()}, contact2: ${conversationPdas.contact2.toBase58()}, payer: ${currentWalletKey.toBase58()}, conversation: ${conversationPdas.conversation.toBase58()}`);
      //console.log('getting latest blockhash...');
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;  

      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);
      
  /*
      const signedTransaction = await this.SolChatWallet.signTransaction(tx, false, true, deeplinkRoute)
        .catch(reject);

      if(!signedTransaction)
        return;

      console.log('sending transaction...', signedTransaction);
      const signature = await anchor.web3
        .sendAndConfirmRawTransaction(
          this.connection, 
          tx.serialize({ requireAllSignatures: false, verifySignatures: false }), 
          {skipPreflight: true, commitment:'confirmed'}
        )
        .catch(err=>{
          reject(JSON.stringify(err));
        });
  */
      //console.log('signature: ', signature);
      if(!signature)
          return;

      if(signature)
        resolve(signature);
      else
        reject("didn't receive a signature");
      
    });
  }

  async getDirectMessages(contactA: PublicKey, contactB: PublicKey){
    return new Promise<DirectConversation>(async (resolve,reject) => {
      if(!contactA) {
        reject('contactA must be specified');
        return;      
      }

      if(!contactB) {
        reject('contactB must be specified');
        return;
      }

      const conversationPdas = this.getConversationPdas(contactA, contactB);
      //console.log(`getting contact1: ${conversationPdas.contact1.toBase58()}, contact2: ${conversationPdas.contact2.toBase58()}, conversation: ${conversationPdas.conversation.toBase58()}`);
      const program = this.getProgram();    
      const conversation = await program.account.directConversation
        .fetchNullable(conversationPdas.conversation)
        .catch(err=>console.error(err));
      //console.log('conversation: ', conversation);
      
      resolve({
        address: conversationPdas.conversation,
        contact1: conversationPdas.contact1,
        contact2: conversationPdas.contact2,
        messages: conversation?.messages ?? [],
      } as DirectConversation);
    });
  }


  private async onConversationChangeHandler(changeInfo: web3.AccountChangeCallback){
    const program = this.getProgram();
    this.solChatAccountChangeCallbackHandlers.forEach(f => {
      program.account.
      f(changeInfo);
    });
  }


  private async registerOnConversationChangeCallback(f) {
    this.solChatAccountChangeCallbackHandlers.push(f);
  }

  async subscribeToConversationBetween(contactA: Contact, contactB: Contact, fn) {
    return new Promise<void>(async (resolve,reject) => {
      if(!contactA?.address) {
        reject("contactA must be specified");
        return;
      }

      if(!contactB?.address) {
        reject("contactB must be specified");
        return;
      }

      const program = this.getProgram();
      const conversationAddress = this.getConversationPdas(contactA.address, contactB.address).conversation;
      if(!this.solChatAccountChangeCallbackHandlers.has(conversationAddress.toBase58())) {
        const eventEmitter = program.account
          .directConversation
          .subscribe(conversationAddress, 'confirmed');

          eventEmitter
          .on('change', fn);

        this.solChatAccountChangeCallbackHandlers.set(conversationAddress.toBase58(),eventEmitter);
      }

      resolve();
    });
  }

  getGroupContactPda(groupAddress: PublicKey, contactAddress: PublicKey) : PublicKey {
    const program = this.getProgram();
    let [groupContactPda, groupContactPdaBump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("group_contact"),
        groupAddress.toBuffer(),
        contactAddress.toBuffer(),
      ], program.programId);

    return groupContactPda;
  }

  async getGroup(groupAddress: PublicKey) : Promise<Group> {
    const program = this.getProgram();
    const group = await program.account.group.fetch(groupAddress);
    group.address = groupAddress;
    return group;
  }


  async getContactGroupContacts(contactAddress: PublicKey) {
    return new Promise<GroupContact[]>(async (resolve,reject) => {
      const program = this.getProgram();
      const groupContacts = await program.account.groupContact
        .all([{ memcmp: { offset: 41, bytes: contactAddress.toBase58() }}])
        .catch(err=>reject(err.toString()));

      const groupContactAccounts = groupContacts.map(gc=>{
        gc.account.address = gc.publicKey;
        return gc.account;
      })

      resolve(groupContactAccounts);
    });      
  }

  async getContactGroups(contactAddress: PublicKey) : Promise<Group[]> {
    return new Promise<Group[]>(async (resolve,reject) => {
      const contactGroupContacts = await this.getContactGroupContacts(contactAddress)
        .catch(err=>reject(err.toString()));

      if(!contactGroupContacts)
        return;
      
      const program = this.getProgram();
      const promises = contactGroupContacts.map(gc=> this.getGroup(gc.group));
      const groups = await Promise
        .all(promises)
        .catch(err=>console.log(err));
      
      resolve(groups);
    });
  }

  async createGroup(groupName: string, deeplinkRoute = "") {
    return new Promise<Group>(async (resolve,reject) =>{
      if(!groupName) {
        reject("groupName is required");
        return;
      }
      
      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }

      const groupData = "";
      const program = this.getProgram();
      const contactPda = this.getCurrentWalletContactPda();
      const groupNonce = Math.floor(Math.random() * Math.pow(2,16));
      console.log('contactPda: ', contactPda?.toBase58());
      console.log('groupNonce: ', groupNonce);

      let [groupPda, groupPdaBump] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("group"), 
          currentWalletKey.toBuffer(),
          new anchor.BN(groupNonce).toArrayLike(Buffer, 'be', 2),
        ], program.programId);
      const groupContactPda = this.getGroupContactPda(groupPda, contactPda);
      console.log('groupContactPda: ', groupContactPda.toBase58());

      const tx = await program.methods
        .createGroup(groupNonce, groupName, groupData)
        .accounts({
          signer: currentWalletKey,
          contact: contactPda,
          group: groupPda,
          signerGroupContact: groupContactPda,
        })
        .transaction();
      
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;  
  
      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);
      
      if(!signature)
        return;

      const group = await this.getGroup(groupPda)
        .catch(err=>reject(err));

      if(!group)
        return;

      resolve(group);
    });
  }

  async updateGroup(group: Group, deeplinkRoute="") {
    return new Promise<Group>(async (resolve,reject) => {
      const writeableGroup = group as WriteableGroup;
      if(!writeableGroup.name) {
        reject("name is required");
        return;
      }

      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }
    
      const currentWalletContactAddress = this.getCurrentWalletContactPda();
      const signerGroupContactAddress = this.getGroupContactPda(group.address, currentWalletContactAddress);

      const program = this.getProgram(deeplinkRoute);
      const tx = await program.methods
        .editGroup(writeableGroup.name, writeableGroup.data)
        .accounts({
          group: group.address,
          signer: currentWalletKey,
          signerContact: currentWalletContactAddress,
          signerGroupContact: signerGroupContactAddress
        })
        .transaction();

      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;  
    
      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(err=>reject(err.toString()));
        
      console.log('signature: ', signature);
      if(!signature)
        return;
  
      const updatedGroup = await this.getGroup(group.address)
        .catch(err=>reject(err));
  
        if(!updatedGroup)
          return;
  
        resolve(updatedGroup);
    });
  }


  async createGroupContact(groupAddress: PublicKey, contactAddress: PublicKey, deeplinkRoute = "") {
    return new Promise<GroupContact>(async (resolve,reject) => {
      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }

      const program = this.getProgram();
      const signerContactPda = this.getCurrentWalletContactPda();
      const signerGroupContactPda = this.getGroupContact(groupAddress, signerContactPda);
      const newGroupContact = this.getGroupContact(groupAddress, contactAddress);

      const tx = await program.methods
        .createGroupContact()
        .accounts({
          signer: currentWalletKey,
          signerContact: signerContactPda,
          group: groupAddress,
          signerGroupContact: signerGroupContactPda,
          groupContact: newGroupContact,
          contact: contactAddress
        })
        .transaction();

      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;

      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);
        
      if(!signature)
        return;    

      const groupContact = await program.account.groupContact.fetch(newGroupContact);
      resolve(groupContact);
    });
  }

  async setGroupContactRole(groupAddress: PublicKey, groupContactAddress: PublicKey, role: GroupContactRole, deeplinkRoute = "") {
    return new Promise<GroupContact>(async (resolve,reject) => {
      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }

      const program = this.getProgram();
      const signerContact = this.getCurrentWalletContact();
      const signerGroupContact = this.getGroupContact(groupAddress, signerContact);

      const tx = await program.methods
      .setGroupContactRole(role) //write
      .accounts({
        signer: currentWalletKey,
        signerContact: signerContact,
        signerGroupContact: signerGroupContact,
        groupContact: groupContactAddress,
      })
      .transaction();
    
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;

      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);
        
      if(!signature)
        return;    

      const groupContact = await program.account.groupContact.fetch(groupContactAddress);
      resolve(groupContact);
    });
  }

  async setGroupContactPreference(groupAddress: PublicKey, groupContactAddress: PublicKey, preference: GroupContactPreference, deeplinkRoute = "") {
    return new Promise<GroupContact>(async (resolve,reject) => {
      const currentWalletKey = this.getCurrentWalletPublicKey();
      if(!currentWalletKey) {
        reject('not connected to a wallet');
        return;
      }

      const program = this.getProgram();
      const signerContact = this.getCurrentWalletContact();
      const signerGroupContact = this.getGroupContact(groupAddress, signerContact);

      const tx = await program.methods
      .setGroupContactPreference(preference) //subscribe
      .accounts({
        signer: currentWalletKey,
        signerContact: signerContact,
        signerGroupContact: signerGroupContact,
      })
      .transaction();
    
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = currentWalletKey;

      console.log('signing and sending transaction...');
      const signature = await this.wallet
        .signAndSendTransaction(tx, false, true, deeplinkRoute) 
        .catch(reject);
        
      if(!signature)
        return;    

      const groupContact = await program.account.groupContact.fetch(signerGroupContact);
      resolve(groupContact);
    });
  }

  async getGroupContacts(group: PublicKey) {
    return new Promise<GroupContact[]>(async (resolve,reject) => {
      const program = this.getProgram();
      const groupContacts = await program.account.groupContact
        .all([{ memcmp: { offset: 9, bytes: group.toBase58() }}])
        .catch(err=>reject(err.toString()));

      const groupContactAccounts = groupContacts.map(gc=>{
        gc.account.address = gc.publicKey;
        return gc.account;
      })

      resolve(groupContactAccounts);
    });
  }

}