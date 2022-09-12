import WalletInterface from './WalletInterface';


export interface MintInfo {
    readonly address : string;
    readonly multiplier: number;
}

export interface QueryResult {
    readonly amount: number;
    readonly data?: any;
}


export default interface TokenSwapInterface {
    setWallet(wallet: WalletInterface): void;
    getOutQuote(inToken: MintInfo, inAmount: number, slippagePercent: number, outToken: MintInfo) : Promise<QueryResult>;
    getInQuote(outToken: MintInfo, outAmount: number, slippagePercent:number, inToken: MintInfo) : Promise<QueryResult>;
    swap(inToken: MintInfo, inAmount: number, allowedSlippagePercent: number, outToken: MintInfo, deeplinkRoute: string): Promise<string>;
}