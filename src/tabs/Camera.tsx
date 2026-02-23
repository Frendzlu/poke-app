import { StyleSheet, Text, View } from "react-native";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

function CameraTab() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Camera Tab</Text>
    </View>
  );
}

export default CameraTab;
