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
          SettingsTab: {
            screens: {
              SettingsScreen: 'settings',
            },
          },
        },
      },
      Modal: 'modal',
      CreateStore: 'create_store',
      CreateProduct: 'create_product',
      NotFound: '*',
    },
  },
};

export default linking;
