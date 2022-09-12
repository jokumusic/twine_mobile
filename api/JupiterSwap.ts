import { Transaction,  } from "@solana/web3.js";
import WalletInterface from "./WalletInterface";



export const Mint = {
  USDC: {address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", multiplier: 1000000} as MintInfo,
  SOL: {address: "So11111111111111111111111111111111111111112", multiplier: 1000000000} as MintInfo,
  SHDW: {address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", multiplier: 1000000} as MintInfo,
};

export interface MintInfo {
  readonly address : string;
  readonly multiplier: number;
}

export interface QueryResult {
  readonly amount: number;
  readonly maxAmount: number;
}


export async function swap(
  wallet: WalletInterface,
  inToken: MintInfo,
  inAmount: number,
  allowedSlippagePercent =1,
  outToken: MintInfo,
  deeplinkRoute = ""
) {
   
  const quote = getOutQuote(inToken, inAmount, allowedSlippagePercent, outToken);

  const transactions = await (
    await fetch("https://quote-api.jup.ag/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: quote,
        userPublicKey: wallet.getWalletPublicKey()?.toBase58(),
      }),
    })
  ).json();

  const { setupTransaction, swapTransaction, cleanupTransaction } = transactions;

  if (setupTransaction || cleanupTransaction)
    throw new Error("should only be 1tx");

  const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
  return await wallet.signAndSendTransaction(transaction, true, true, deeplinkRoute);
};


export async function getOutQuote(inToken: MintInfo, inAmount: number, slippagePercent=1, outToken: MintInfo){
  const convertedAmount = inAmount * inToken.multiplier;
  const url = `https://quote-api.jup.ag/v1/quote?inputMint=${inToken.address}&outputMint=${outToken.address}&amount=${convertedAmount}&swapMode=ExactIn&slippage=${slippagePercent}`;
  const result = await (await fetch(url)).json();
  if (!result?.data) throw new Error("No routes found");
  const bestRoute = result.data[0];
  return bestRoute;
}

export async function getInQuote(outToken: MintInfo, outAmount: number, slippagePercent:number = 1, inToken: MintInfo){
  const convertedAmount = outAmount * outToken.multiplier;
  const url = `https://quote-api.jup.ag/v1/quote?inputMint=${inToken.address}&outputMint=${outToken.address}&amount=${convertedAmount}&swapMode=ExactOut&slippage=${slippagePercent}`;
  const result = await (await fetch(url)).json();
  if (!result?.data) throw new Error("No routes found");
  const bestRoute = result.data[0];
  return bestRoute;
}
