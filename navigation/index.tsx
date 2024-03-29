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
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import { CartIcon } from '../components/CartIcon';
import { ScreenProps } from 'react-native-screens';
import ContactScreen from '../screens/ContactScreen';
import EditContactScreen from '../screens/EditContactScreen';
import { PressableIcon } from '../components/Pressables';
import { TwineContext } from '../components/TwineProvider';
import ManageWalletsScreen from '../screens/ManageWalletsScreen';


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
        <Stack.Screen name="ManageWallets" component={ManageWalletsScreen}/>
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
      </Stack.Group>
    </Stack.Navigator>
  );
}




/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const twineContext = React.useContext(TwineContext);

  async function connectWallet(navigation, deeplinkRoute:string) {
    navigation.navigate("ManageWallets");
   /* if(twineContext.walletPubkey) 
    {
      Alert.alert("wallet connect",
        "You're already connected to a wallet. Do you want to connect to another wallet?",
        [{
            text:'Yes',
            onPress: ()=> navigation.navigate("ManageWallets"),
        },
        {
          text: 'No',
          style: 'cancel',
        }]
      );     
    }
    else 
    {
      if(twineContext.getCurrentWalletName() == "Phantom")
        twineContext
          .connectWallet(true, deeplinkRoute)
          .catch(err=>Alert.alert('error', err));
      else
        navigation.navigate("ManageWallets")    
    } 
    */ 
  }

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
                onPress={()=>connectWallet(navigation, "ShopTab")}            
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
              onPress={()=>connectWallet(navigation, "ContactTab")} 
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
                onPress={()=>connectWallet(navigation, "CartTab")} 
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
              onPress={()=>connectWallet(navigation, "StoresTab")} 
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
