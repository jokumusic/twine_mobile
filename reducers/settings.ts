import {createStore} from "redux"

export const setMasterKey = (pubKey: string) => ({ type: types.MASTER_KEY, key: 'masterKey', value: pubKey });


export const InitalSettings = {
  masterKey: '',
}

const types = {
  MASTER_KEY: 'MASTER_KEY',
}

export function settingReducer(state: any, action: any) {
  switch (action.type) {
    case types.MASTER_KEY:
      return {...state, masterKey: action.value}
  }
}








  