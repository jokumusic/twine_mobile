import * as React from 'react';
import { ColorSchemeName, AppRegistry, Text } from 'react-native';
import { Provider } from 'react-redux';
import {store,persistor} from './reducers/store';
import { PersistGate } from 'redux-persist/integration/react';


import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import {DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme, Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (      
      <Provider store={store}>
        <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider theme={PaperDarkTheme}>
          <Navigation colorScheme={colorScheme}/>
          <StatusBar />
          </PaperProvider>
        </SafeAreaProvider>
        </PersistGate>
      </Provider>
    );
  }
}

const theme = {
  colors: {
    primary: 'tomato',
    secondary: 'yellow',
  },
};
/*
export function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

//AppRegistry.registerComponent(appName, () => Main);
*/