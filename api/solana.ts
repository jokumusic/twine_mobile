import * as Web3 from '@solana/web3.js';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import * as spl_token from '@solana/spl-token';
import { ASSOCIATED_TOKEN_PROGRAM_ID, mintToInstructionData, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from "../dist/browser/index";

export default class Solana {
  private connection: Web3.Connection;
  
  constructor(connection: Connection) {
    if(!connection)
      throw new Error("connection must be specified")
      
    this.connection = connection;
  }

  async getAccountInfo(pubkey: PublicKey){
    return this.connection.getAccountInfo(pubkey);    
  }

  async getAccountLamports(pubkey: PublicKey) {
    return this.connection.getBalance(pubkey);
  }

  async getAccountSol(pubkey: PublicKey) {
    const lamports = await this.getAccountLamports(pubkey);
    const sol = lamports / LAMPORTS_PER_SOL;
    return sol;
  }

  async getTokenAddress(mint: PublicKey, account: PublicKey, allowOffCurve=false) {
    return spl_token.getAssociatedTokenAddress(mint, account, allowOffCurve, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  }

  async getTokenAccount(mint: PublicKey, account: PublicKey, allowOffCurve=false) {
    const tokenAddress = await this.getTokenAddress(mint, account, allowOffCurve);
    try{
      const tokenAccount = await spl_token.getAccount(this.connection, tokenAddress, 'confirmed', TOKEN_PROGRAM_ID);
      return tokenAccount;
    } catch(err) {
      //console.log('spl_token.getAccount: ', err);
    }

    return null;
  }

  async getTokenBalance(mint: PublicKey, account: PublicKey, allowOffCurve=false){
    const tokenAccount = await this.getTokenAccount(mint, account, allowOffCurve);
    return Number(tokenAccount?.amount || 0);    
  }

  createAssociatedTokenAccountInstruction(mint: PublicKey, payer: PublicKey, associatedTokenAccount: PublicKey, associatedTokenAccountOwner: PublicKey) {
    return spl_token.createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAccount,
      associatedTokenAccountOwner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  createTokenTransferInstruction(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number) {
    return spl_token.createTransferInstruction(
      source,
      destination,
      owner,
      amount,
      [],
      TOKEN_PROGRAM_ID,
    );
  }
   
}
