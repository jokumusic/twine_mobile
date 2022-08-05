import * as Web3 from '@solana/web3.js'
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

  export const LAMPORTS_PER_SOL = Web3.LAMPORTS_PER_SOL

  export async function getAccountInfo(pubkey: String){
    const key = new Web3.PublicKey(pubkey);
    const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
    return await connection.getAccountInfo(key);    
  }
