import * as Web3 from '@solana/web3.js';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import * as spl_token from '@solana/spl-token';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as tokenFaucetIdl from "../target/idl/tokenfaucet.json";
import * as anchor from "../dist/browser/index";
import {Mint} from '../constants/Mints';


export default class Solana {
  private connection: Web3.Connection;
  private usdc_mint: PublicKey;
  
  constructor(network: string) {
    this.connection = new Connection(Web3.clusterApiUrl(network));

    if(network == "mainnet-beta")
      this.usdc_mint = new PublicKey(Mint.USDC.address);
    else {
      const [dev_mint] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("mint")], new PublicKey(tokenFaucetIdl.metadata.address));
      this.usdc_mint = dev_mint;
    }
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

  async getUsdcTokenAddress(account: PublicKey, allowOffCurve=false) {
    return spl_token.getAssociatedTokenAddress(this.usdc_mint, account, allowOffCurve, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  }

  async getUsdcAccount(account: PublicKey, allowOffCurve=false){
    const usdcAtaAddress = await this.getUsdcTokenAddress(account, allowOffCurve);
    try{
      const ataData = await spl_token.getAccount(this.connection, usdcAtaAddress, 'confirmed', TOKEN_PROGRAM_ID);
      return ataData
    } catch(err) {
    }

    return null;
  }

  async getUsdcBalance(account: PublicKey){
    const usdcAtaAddress = await this.getUsdcTokenAddress(account);
    const ataData = await this.getUsdcAccount(account);
    const convertedAmount = Number(ataData?.amount || 0) / Mint.USDC.multiplier;  
    return convertedAmount;
  }


  createAssociatedTokenAccountInstruction(payer: PublicKey, associatedTokenAccount: PublicKey, associatedTokenAccountOwner: PublicKey ) {
    return spl_token.createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAccount,
      associatedTokenAccountOwner,
      this.usdc_mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  createTransferInstruction(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number) {
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
