import { StyleSheet, Platform, Text, View } from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Pressable } from "react-native-gesture-handler";

function MapTab() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
  return (
    <Pressable onLongPress={() => console.log("Long Pressed")}>
      {Platform.OS === "ios" && <AppleMaps.View style={{ flex: 1 }} />}
      {Platform.OS === "android" && <GoogleMaps.View style={{ flex: 1 }} />}
    </Pressable>
  );
}

export default MapTab;
