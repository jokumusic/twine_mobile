import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function ProductDetailsScreen(props) {
    const [products, setProducts] = useState([]);

    return (
        <View>
            <Button title="Checkout" />
        </View>
    );
}