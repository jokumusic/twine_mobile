import * as React from 'react';
import {Suspense} from 'react';
import { ColorSchemeName, AppRegistry, Text,View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import {store,persistor} from './reducers/store';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import {ActivityIndicator, DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { CartProvider } from './components/CartProvider';
import {LogBox} from "react-native";


export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  LogBox.ignoreLogs([
    "ViewPropTypes will be removed",
    "ColorPropType will be removed",
    "Non-serializable values were found in the navigation state"
  ]);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider store={store}>        
        <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
          <SafeAreaProvider>
            <PaperProvider theme={PaperDarkTheme}>
              <Suspense
                fallback={
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      style={styles.loadingIndicator}
                    />
                  </View>
                }>
                <CartProvider>
                  <Navigation colorScheme={colorScheme}/>
                </CartProvider>
                <StatusBar />
              </Suspense>
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


const styles = StyleSheet.create({
  loadingContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginVertical: 'auto',
  },
  shell: {
    height: '100%',
  },
});