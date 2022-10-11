import { Connection, Transaction, clusterApiUrl } from "@solana/web3.js";
import WalletInterface from "./WalletInterface";
import TokenSwapInterface, {MintInfo, QueryResult} from "./TokenSwapInterface";
import { Wallet } from "@project-serum/anchor";


export class JupiterSwap implements TokenSwapInterface {
  private connection: Connection;
  private wallet: WalletInterface;

  constructor(connection: Connection, wallet?: WalletInterface) {
    if(!connection)
      throw new Error("connection must be specified")
    
    this.connection = connection;
    this.wallet = wallet;
  }

  setWallet(wallet: WalletInterface){
    this.wallet = wallet;
  }

  async swap(inToken: MintInfo, inAmount: number, allowedSlippagePercent = 1, outToken: MintInfo, deeplinkRoute = "" ) {
   
    const quote = this.getOutQuote(inToken, inAmount, allowedSlippagePercent, outToken);
    const walletPubkey = this.wallet.getWalletPublicKey();
    const transactions = await (
      await fetch("https://quote-api.jup.ag/v1/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: quote,
          userPublicKey: walletPubkey?.toBase58(),
        }),
      })
    ).json();

    const { setupTransaction, swapTransaction, cleanupTransaction } = transactions;

    if (setupTransaction || cleanupTransaction)
      throw new Error("should only be 1tx");

    const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = walletPubkey;
    const signature = await this.wallet.signAndSendTransaction(transaction, true, true, deeplinkRoute);
    return signature;
  };

  async getOutQuote(inToken: MintInfo, inAmount: number, slippagePercent=1, outToken: MintInfo) {
    const convertedAmount = inAmount * inToken.multiplier;
    const url = `https://quote-api.jup.ag/v1/quote?inputMint=${inToken.address}&outputMint=${outToken.address}&amount=${convertedAmount}&swapMode=ExactIn&slippage=${slippagePercent}`;
    const result = await (await fetch(url)).json();
    if (!result?.data) {
      console.log('result: ', result);
      throw new Error("No routes found");
    }
    const bestRoute = result.data[0];

    return {
      amount: bestRoute.outAmount / outToken.multiplier,
      data: bestRoute
    } as QueryResult;
  }

  async getInQuote(outToken: MintInfo, outAmount: number, slippagePercent:number = 1, inToken: MintInfo) {
    const convertedAmount = outAmount * outToken.multiplier;
    const url = `https://quote-api.jup.ag/v1/quote?inputMint=${inToken.address}&outputMint=${outToken.address}&amount=${convertedAmount}&swapMode=ExactOut&slippage=${slippagePercent}`;
    const result = await (await fetch(url)).json();
    
    if (!result?.data) {
      console.log('result: ', result);
      throw new Error("No routes found");
    }
    const bestRoute = result.data[0];

    return {
      amount: bestRoute.inAmount / inToken.multiplier,
      data: bestRoute
    } as QueryResult;
  }

}