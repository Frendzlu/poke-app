import { StyleSheet, Platform, Text, View } from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function MapTab() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onEnd((event) => {
      // Logic to run when the long press is triggered
      console.log(`Long Pressed at: ${event.x}, ${event.y}`);
    })
    .runOnJS(true);
  return (
    <GestureDetector gesture={Gesture.Simultaneous(longPressGesture)}>
      <View style={styles.pressable}>
        {Platform.OS === "ios" && <AppleMaps.View style={{ flex: 1 }} />}
        {Platform.OS === "android" && <GoogleMaps.View style={{ flex: 1 }} />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});

export default MapTab;
