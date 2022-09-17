import {MintInfo} from "../api/TokenSwapInterface";

export const Mint = {
    USDC: {name: 'USDC', 
     //address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", //mainnet
     address: "F6g9cmPtNAec9GYBF4s9vtX6hCE9eUxnFcv3bL8WsNuj",
     multiplier: 1000000} as MintInfo,
    SOL: {name: 'SOL', address: "So11111111111111111111111111111111111111112", multiplier: 1000000000} as MintInfo,
    SHDW: {name: 'SHDW', address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", multiplier: 1000000000} as MintInfo,
};