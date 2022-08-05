/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText, 
  View as DefaultView,
  TextInput as DefaultTextInput,
  Button as DefaultButton ,
  FlatList as DefaultFlatList,
  TouchableOpacity as DefaultTouchableOpacity,
  StyleSheet
} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};


const styles = StyleSheet.create({
  item: {
    marginBottom: 1,
    padding: 15,
  },
  title: {
    color: 'white',
  },
})


export type TextProps = ThemeProps & DefaultText['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}


export type ViewProps = ThemeProps & DefaultView['props'];

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}


export type TextInputProps = ThemeProps & DefaultTextInput['props'];

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps} = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  return <DefaultTextInput style={[{ color }, style]} {...otherProps} />;
}


export type ButtonProps = ThemeProps & DefaultButton['props'];

export function Button(props: ButtonProps) {
  const { lightColor, darkColor, ...otherProps} = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return <DefaultButton {...otherProps} />;
}


export type FlatListProps = ThemeProps & DefaultFlastList['props'];

export function FlatList(props: ButtonProps) {
  const { lightColor, darkColor, items, onPressItem, ...otherProps} = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultFlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <DefaultTouchableOpacity
          style={[styles.item, { backgroundColor: `rgba(59, 108, 212, ${Math.max(1 - index / 10, 0.4)})` }]}
          onPress={() => onPressItem(item.id)}
        >
          <Text style={styles.title}>{item.title}</Text>
        </DefaultTouchableOpacity>
      )}

      {...otherProps}
    />)
}
