import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";
import Color from "color";

const BlurBg = ({ tintColor }: { tintColor: string }) => (
  <BlurView
    intensity={12}
    // tint="dark"
    style={[styles.background, { backgroundColor: `${tintColor}20` }]}
  ></BlurView>
);

function BottomSheetWrapper(props: {
  children: React.ReactNode;
  tintColor: string;
  snapPoints?: (string | number)[];
}) {
  const sheetRef = useRef<BottomSheet>(null);
  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={props.snapPoints}
      enableDynamicSizing={true}
      backgroundComponent={() => (
        <BlurBg tintColor={Color(props.tintColor).hex()} />
      )}
    >
      <BottomSheetScrollView style={styles.contentContainer}>
        {props.children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    borderRadius: 16,
    overflow: "hidden",
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    padding: 8,
  },
});

export default BottomSheetWrapper;
