import { FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import AboutScreen from '../screens/AboutScreen';
import CreateStoreScreen from '../screens/CreateStoreScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import ShopScreen from '../screens/ShopScreen';
import StoresScreen from '../screens/StoresScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoreDetailsScreen from '../screens/StoreDetailsScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import EditStoreScreen from '../screens/EditStoreScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import EditProductScreen from '../screens/EditProductScreen';
import CartScreen from '../screens/CartScreen';


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
        <Stack.Screen name="CreateStore" component={CreateStoreScreen} />
        <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
        <Stack.Screen name="EditStore" component={EditStoreScreen} />
        <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
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
            <Pressable
              onPress={() => navigation.navigate('About')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome5
                name="info-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="StoresTab"
        component={StoresScreen}
        options={({ navigation }: RootTabScreenProps<'StoresTab'>) => ({
          title: 'Manage Stores',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='store' color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('CreateStore')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome5
                name="plus-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />

      <BottomTab.Screen
        name="CartTab"
        component={CartScreen}
        options={({ navigation }: RootTabScreenProps<'CartTab'>) => ({
          title: 'Cart',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name='shopping-cart' color={color} />,
        })}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={25} style={{ marginBottom: -3}} {...props} />;
}
