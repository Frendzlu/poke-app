import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import {
  Frame,
  useCameraDevice,
  useCameraPermission,
  Camera,
  runAsync,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  Face,
  FrameFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";

function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const isActive = isFocused && appState.current === "active";

  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    // detection options
  }).current;

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    return () => {
      // you must call `stopListeners` when current component is unmounted
      stopListeners();
    };
  }, []);

  useEffect(() => {
    if (!device) {
      // you must call `stopListeners` when `Camera` component is unmounted
      stopListeners();
      return;
    }

    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log({ status });
    })();
  }, [device]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    console.log("faces detected", faces);
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAsync(frame, () => {
        "worklet";
        const faces = detectFaces(frame);
        // ... chain some asynchronous frame processor
        // ... do something asynchronously with frame
        handleDetectedFaces(faces);
      });
      // ... chain frame processors
      // ... do something with frame
    },
    [handleDetectedFaces],
  );

  return (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  );
}

export default CameraScreen;
