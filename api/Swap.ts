import { Transaction } from "@solana/web3.js";
import WalletInterface from "./WalletInterface";

const mints = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  SOL: "So11111111111111111111111111111111111111112",
  SHDW: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
};

export const swap = async (
  wallet: WalletInterface,
  fromToken: "SOL" | "USDC" | "SHDW",
  toToken: "SOL" | "USDC" | "SHDW",
  amount: number,
  deeplinkRoute = ""
) => {  
    const { data } = await (
        await fetch(
        `https://quote-api.jup.ag/v1/quote?inputMint=${mints[fromToken]}&outputMint=${mints[toToken]}&amount=${amount}&swapMode=ExactOut&slippage=1`
        )
    ).json();

    const routes = data;

    if (!routes.length) throw new Error("No routes found");

  // get serialized transactions for the swap
  const transactions = await (
    await fetch("https://quote-api.jup.ag/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // route from /quote api
        route: routes[0],
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