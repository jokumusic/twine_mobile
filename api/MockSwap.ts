import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import WalletInterface from "./WalletInterface";
import TokenSwapInterface, {MintInfo, QueryResult} from "./TokenSwapInterface";
import * as anchor from "../dist/browser/index";
import * as tokenFaucetIdl from "../target/idl/tokenfaucet.json";
import type { Tokenfaucet }  from "../target/types/tokenfaucet";
import { JupiterSwap } from "./JupiterSwap";
import * as spl_token from "@solana/spl-token";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Mint } from "../constants/Mints";

const tokenfauceProgramId = new PublicKey(tokenFaucetIdl.metadata.address);
const USDC_MINTINFO = {name: 'USDC', address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", multiplier: 1000000} as MintInfo;

export class MockSwap implements TokenSwapInterface {
    private network: string;
    private wallet: WalletInterface;  
    private jupiterSwap: JupiterSwap;
    private connection: Connection;
    private paymentTokenMintAddress = new PublicKey(Mint.USDC.address);

    constructor(network: string, wallet?: WalletInterface) {
      this.network = network;
      this.wallet = wallet;
      this.connection = new Connection(clusterApiUrl(network))
      this.jupiterSwap = new JupiterSwap(network, wallet);
    }

    private getTokenfaucetProgram() {
        const wallet = {
            signTransaction: (tx: Transaction) => this.wallet.signTransaction(tx,false,true),
            signAllTransactions: (txs: Transaction[]) => this.wallet.signAllTransactions(txs,false,true),
            publicKey: this.wallet.getWalletPublicKey(),
        };

        const provider = new anchor.AnchorProvider(this.connection, wallet, anchor.AnchorProvider.defaultOptions());
        const tokenfaucetProgram = new anchor.Program(tokenFaucetIdl, tokenfauceProgramId, provider) as anchor.Program<Tokenfaucet>;
        return tokenfaucetProgram;
    }

    setWallet(wallet: WalletInterface){
        this.wallet = wallet;
        this.jupiterSwap.setWallet(wallet);
    }

    async swap(inToken: MintInfo, inAmount: number, allowedSlippagePercent = 1, outToken: MintInfo, deeplinkRoute = "" ) {
        return new Promise<string>(async (resolve,reject)=>{
            if(inAmount <= 0) {
                reject('inAmount must be greater than 0');
                return;
            }

            if(inToken.name == Mint.USDC.name) {
                inToken = USDC_MINTINFO;
            }
            if(outToken.name == Mint.USDC.name) {
                outToken = USDC_MINTINFO;
            }

            const quote = await this.getOutQuote(inToken, inAmount, allowedSlippagePercent, outToken);
            console.log(`swapping ${inAmount} to ${quote.amount}`);
            const convertedOutAmount = quote.amount * outToken.multiplier;
            console.log('convertedOutAmount: ', convertedOutAmount);

            const currentPubkey = this.wallet.getWalletPublicKey();
            if(!currentPubkey) {
                reject('not connected to a wallet.');
                return;
            }
            
            const tokenfaucetProgram = this.getTokenfaucetProgram();        
            const currentWalletAtaAddress = await spl_token.getAssociatedTokenAddress(this.paymentTokenMintAddress, currentPubkey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            console.log('current wallet USDC address: ', currentWalletAtaAddress);
            let currentWalletAta;
            try {
                currentWalletAta = await spl_token.getAccount(this.connection, currentWalletAtaAddress, 'confirmed', TOKEN_PROGRAM_ID);
            } catch(ex) {
            }

            const tx = new anchor.web3.Transaction();

            if(!currentWalletAta) {
                const createPayToAtaIx = spl_token.createAssociatedTokenAccountInstruction(
                    currentPubkey,
                    currentWalletAtaAddress,
                    currentPubkey,
                    this.paymentTokenMintAddress,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID);
                
                tx.add(createPayToAtaIx);
            }

            const paymentTokenAirdropIx = await tokenfaucetProgram.methods
                .executeAirdrop(new anchor.BN(convertedOutAmount))
                .accounts({
                    signer: currentPubkey,
                    mint: this.paymentTokenMintAddress,
                    recipient: currentWalletAtaAddress,
                })
                .instruction();        
            
            tx.add(paymentTokenAirdropIx)
            tx.feePayer = currentPubkey;
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const signature = await this.wallet.signAndSendTransaction(tx, false, true)
                .catch(reject);

            if(!signature)
                return;

            resolve(signature);
        });
    }


    async getOutQuote(inToken: MintInfo, inAmount: number, slippagePercent=1, outToken: MintInfo) {
        if(inToken.name == Mint.USDC.name) {
            inToken = USDC_MINTINFO;
        }
        if(outToken.name == Mint.USDC.name) {
            outToken = USDC_MINTINFO;
        }
        return this.jupiterSwap.getOutQuote(inToken, inAmount, slippagePercent, outToken);
    }

    async getInQuote(outToken: MintInfo, outAmount: number, slippagePercent:number = 1, inToken: MintInfo) {
        if(inToken.name == Mint.USDC.name) {
            inToken = USDC_MINTINFO;
        }
        if(outToken.name == Mint.USDC.name) {
            outToken = USDC_MINTINFO;
        }
        return this.jupiterSwap.getInQuote(outToken, outAmount, slippagePercent, inToken);
    }
}