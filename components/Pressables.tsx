import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, StyleSheetProperties, Text, View } from "react-native";
import NamespaceFactory from "../dist/browser/types/src/program/namespace";


export function PressableImage({show, source, style, onPress}) { 
  if(show){
    return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
      <Image source={source} style={style}/>
    </Pressable>
    );
  } 
  else {
    return (<View/>);
  }
};


export function PressableIcon(props: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    color?: string;
    onPress: any;
    size?: number;
}) {
    const {name,onPress,size, ...extraProps} = props;
    return (
      <Pressable
        onPress={props.onPress}
        style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        })}
      >
        <Ionicons name={props.name} size={props.size ?? 25} style={{paddingBottom: -8}} {...extraProps} />
      </Pressable>
    );
}

export function PressableText(props: {
    onPress: any;
    text: string;
}) {
    return (
      <Pressable
        onPress={props.onPress}
        style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        })}
      >
        <Text {...props}>{props.text}</Text>
      </Pressable>
    );
}