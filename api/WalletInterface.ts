import { PublicKey, Transaction } from "@solana/web3.js";

export default interface WalletInterface {
    getWalletName(): string;
    getWalletPublicKey(): PublicKey|null;
    connect(force?: boolean, deepLinkReturnRoute?: string): Promise<PublicKey>;
    signTransaction(transaction: Transaction, requireAllSignatures?: boolean, verifySignatures?: boolean, deepLinkReturnRoute?: string): Promise<Transaction>;
    //signMessage(message: string, deepLinkReturnRoute?: string): Promise<any>;
    signAndSendTransaction(transaction: Transaction, requireAllSignatures?: boolean, verifySignatures?: boolean, deepLinkReturnRoute?: string): Promise<string>;
    //signAllTransactions(transactions: Transaction[], requireAllSignatures?: boolean, verifySignatures?: boolean, deepLinkReturnRoute?: string): Promise<Transaction[]>;
    //disconnect(deepLinkReturnRoute?: string): Promise<void>;
}
