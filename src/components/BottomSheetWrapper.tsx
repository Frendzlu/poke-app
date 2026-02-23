import React, { useRef, useMemo, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
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

  const [displayChildren, setDisplayChildren] = useState(props.children);
  const [displayTintColor, setDisplayTintColor] = useState(props.tintColor);

  useEffect(() => {
    if (
      props.children === displayChildren &&
      props.tintColor === displayTintColor
    ) {
      return;
    }
    sheetRef.current?.close();
    const timeout = setTimeout(() => {
      setDisplayChildren(props.children);
      setDisplayTintColor(props.tintColor);
      sheetRef.current?.snapToIndex(1);
    }, 200);
    return () => clearTimeout(timeout);
  }, [props.children, props.tintColor]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={props.snapPoints}
      enableDynamicSizing={true}
      enablePanDownToClose={true}
      backgroundComponent={() => (
        <BlurBg tintColor={Color(displayTintColor).hex()} />
      )}
    >
      <BottomSheetScrollView style={styles.contentContainer}>
        {displayChildren}
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
