import { Keypair } from "@solana/web3.js";


//export const setMasterKey = (pubKey: string) => ({ type: types.MASTER_KEY_PUBLIC, key: 'masterKey', value: pubKey });
export const setMasterKeyPair = (keypair: Keypair) => ({ type: types.MASTER_KEYPAIR, value: keypair})


export const InitalSettings = {
  masterKeypair: null,//Keypair.fromSecretKey(Uint8Array.from([36,27,78,204,60,3,248,14,102,126,8,62,215,124,175,101,209,73,21,224,159,178,23,223,211,246,132,187,225,191,152,219,57,237,110,22,164,6,126,248,148,91,35,238,52,182,50,80,27,83,207,147,116,11,51,139,208,224,153,163,225,110,255,231]))
}

const types = {
  MASTER_KEYPAIR: 'MASTER_KEYPAIR',
}

export function settingReducer(state: any, action: any) {
  switch (action.type) {
    //case types.MASTER_KEY_PUBLIC:
    //  return {...state, masterKey: action.value}
    case types.MASTER_KEYPAIR:
      return {...state, masterKeypair: action.value}
  }
}








  