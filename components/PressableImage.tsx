import React from "react";
import { Image, Linking, Pressable, View } from "react-native";

export default function PressableImage({source, style, url}) { 
    if(url){
      return (
      <Pressable 
        onPress={()=>Linking.openURL(url)}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}>
        <Image source={source} style={style}/>
      </Pressable>
      );
    } else {
      return (<View/>);
    }
};