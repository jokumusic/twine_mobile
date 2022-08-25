import React from "react";
import { Image, Linking, Pressable, View } from "react-native";

export default function PressableImage({show, source, style, onPress}) { 
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