import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheetProperties, Text } from "react-native";

export function PressableIcon(props: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    onPress: any;
}) {
    return (
      <Pressable
        onPress={props.onPress}
        style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        })}
      >
        <Ionicons size={25} style={{ marginBottom: -3}} {...props} />
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