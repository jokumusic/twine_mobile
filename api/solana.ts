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

  async getUsdcTokenAddressBySystemAccount(account: PublicKey) {
    return spl_token.getAssociatedTokenAddress(this.usdc_mint, account, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  }

  async getUsdcBalanceBySystemAccount(account: PublicKey){
    const usdcAtaAddress = await this.getUsdcTokenAddressBySystemAccount(account);
    try{
      const ataData = await spl_token.getAccount(this.connection, usdcAtaAddress, 'confirmed', TOKEN_PROGRAM_ID);
      console.log('usdc amount: ', ataData.amount);
      return Number(ataData.amount / Mint.USDC.multiplier );
    } catch(err) {
    }

    return 0;
  }
}
