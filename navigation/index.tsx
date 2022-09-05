import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, ColorSchemeName, Pressable, View } from 'react-native';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import AboutScreen from '../screens/AboutScreen';
import EditStoreScreen from '../screens/EditStoreScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import ShopScreen from '../screens/ShopScreen';
import StoresScreen from '../screens/StoresScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import { CartIcon } from '../components/CartIcon';
import { ScreenProps } from 'react-native-screens';
import ContactScreen from '../screens/ContactScreen';
import EditContactScreen from '../screens/EditContactScreen';
import AddContactScreen from '../screens/AddContactScreen';
import { PressableIcon } from '../components/Pressables';
import * as twine from '../api/twine';


export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen 
          name="EditStore"
          component={EditStoreScreen}
          options={({ navigation }: ScreenProps<'EditStore'>) => ({
            title: 'Store Create/Update',
            headerShown: true,
          })} 
        />
        <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} 
          options={({ navigation }: ScreenProps<'StoreDetails'>) => (
            {
              title: 'Store Details',
              headerRight: ()=> (
                <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                  <CartIcon navigation={navigation} />
                </View>
              )
            })
          } 
        />
        <Stack.Screen 
          name="EditProduct"
          component={EditProductScreen}
          options={({ navigation }: ScreenProps<'EditProduct'>) => ({
            title: 'Product Create/Update',
            headerShown: true,
          })}
        />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
          options={({ navigation }: ScreenProps<'ProductDetails'>) => (
            {
              title: 'Product Details',
              headerRight: ()=> (
                <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                  <CartIcon navigation={navigation} />
                </View>
              )
            })
          } 
        />
        <Stack.Screen name="EditContact" component={EditContactScreen} />
        <Stack.Screen name="AddContact" component={AddContactScreen} />

      </Stack.Group>
    </Stack.Navigator>
  );
}


async function connectWallet(deeplinkRoute) {
  console.log(deeplinkRoute);
  await twine
    .connectWallet(false, deeplinkRoute)
    .catch(err=>{
      if(err.includes('error')) {
        Alert.alert("wallet connect",err);
      }
      else {
        Alert.alert("wallet connect",
          "You're already connected to a wallet. Do you want to connect to another wallet?",
          [{
              text:'Yes',
              onPress: ()=>{ twine.connectWallet(true, deeplinkRoute).catch(err=>Alert.alert("error", err)); },
              style: 'OK'
          },
          {
            text: 'No',
            style: 'cancel',
          }]
        );
      }
    });
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="ShopTab"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={({ navigation }: RootTabScreenProps<'ShopTab'>) => ({
          title: 'Browse',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='search' color={color} />,
          headerRight: () => (
            <View style={{flexDirection: 'row', alignItems: 'flex-end',}}>
              <CartIcon navigation={navigation} />             
              <PressableIcon
                name="wallet"
                onPress={()=>connectWallet("shop")}            
                color={Colors[colorScheme].text}
                style={{ marginRight: 8,  marginLeft: 8, alignSelf: 'flex-start',  }}
              />
              <PressableIcon
                name="ios-information-circle-outline"
                onPress={() => navigation.navigate('About')}            
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </View>
          )
        })}
      />

      <BottomTab.Screen
        name="ContactTab"
        component={ContactScreen}
        options={({ navigation }: RootTabScreenProps<'ContactTab'>) => ({
          title: 'Community',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='people-outline' color={color} />,
          headerRight: () => (
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <CartIcon navigation={navigation} />
            <PressableIcon
              name="wallet"
              onPress={()=>connectWallet("contact")}            
              color={Colors[colorScheme].text}
              style={{ marginRight: 8,  marginLeft: 8, alignSelf: 'flex-start',  }}
            />
            <PressableIcon
              name="person-circle"
              size={34}
              color={Colors[colorScheme].text}
              style={{ marginRight: 15, }}
              onPress={() => navigation.navigate('EditContact')}
            />
            </View>
          ),  
        })}
      />

      <BottomTab.Screen
        name="CartTab"
        component={CartScreen}
        options={({ navigation }: RootTabScreenProps<'CartTab'>) => ({
          title: 'Purchases',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='cart-outline' color={color} />,
          headerRight: ()=>(
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <PressableIcon
                name="wallet"
                onPress={()=>connectWallet("cart")}            
                color={Colors[colorScheme].text}
                style={{ marginRight: 8,  marginLeft: 8, alignSelf: 'flex-start',  }}              
              />
            </View>
          )
        })}
      />

      <BottomTab.Screen
        name="StoresTab"
        component={StoresScreen}        
        options={({ navigation }: RootTabScreenProps<'StoresTab'>) => ({
          title: 'Listings',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='list' color={color} />,
          headerRight: () => (
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <CartIcon navigation={navigation} />
            <PressableIcon
              name="wallet"
              onPress={()=>connectWallet("stores")}            
              color={Colors[colorScheme].text}
              style={{ marginRight: 8,  marginLeft: 8, alignSelf: 'flex-start',  }}
            />
            <PressableIcon
              name="add-circle-outline"
              color={Colors[colorScheme].text}
              style={{ marginRight: 15 }}
              size={34}
              onPress={() => navigation.navigate('EditStore')}
            />
            </View>
          ),
        })}
      />


    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={25} style={{ marginBottom: -3}} {...props} />;
}
