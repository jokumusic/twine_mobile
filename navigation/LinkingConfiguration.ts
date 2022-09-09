/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          ShopTab: {
            screens: {
              ShopScreen: 'shop',
            },
          },
          StoresTab: {
            screens: {
              StoresScreen: 'stores',
            },
          },
          ContactTab: {
            screens: {
              CartScreen: 'contact',
            },
          },        
          CartTab: {
            screens: {
              CartScreen: 'cart',
            },
          },
        },
      },
      Modal: 'modal',
      StoreDetails: 'store_details',
      EditStore: 'edit_store',
      ProductDetails: 'product_details',
      EditProduct: 'edit_product',
      ManageWallets: 'manage_wallets',
      EditContact: 'edit_contact',
      NotFound: '*',
    },
  },
};

export default linking;
