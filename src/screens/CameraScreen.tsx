import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ImageStyle,
  Dimensions,
} from "react-native";
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
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { usePokemonList } from "../contexts/PokemonListContext";

function CameraScreen() {
  const cameraDeviceString = "front";
  const { hasPermission, requestPermission } = useCameraPermission();
  const { favoritePokemonId } = useFavoriteContext();
  const { allPokemon } = usePokemonList();
  const device = useCameraDevice(cameraDeviceString);
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const isActive = isFocused && appState.current === "active";
  const [facesDetected, setFacesDetected] = useState<Face[]>([]);
  const favoritePokemon = allPokemon[favoritePokemonId];
  const [scalingFactors, setScalingFactors] = useState({
    vertical: 1,
    horizontal: 1,
  });
  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    // detection options
  }).current;

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  const { width, height } = Dimensions.get("window");
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

  const handleDetectedFaces = Worklets.createRunOnJS(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      console.log("faces detected", faces);
      setScalingFactors({
        vertical: frameHeight / height,
        horizontal: frameWidth / width,
      });
      setFacesDetected(faces);
    },
  );

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAsync(frame, () => {
        "worklet";
        const faces = detectFaces(frame);
        handleDetectedFaces(faces, frame.width, frame.height);
      });
      // ... chain frame processors
      // ... do something with frame
    },
    [handleDetectedFaces],
  );

  const renderOverlay = () => {
    if (!facesDetected.length) return <></>;
    let overlayElements = facesDetected.map((face, i) => {
      console.log("face", face);
      const { bounds, rollAngle, yawAngle, pitchAngle } = face;

      const style: Partial<StyleProp<ImageStyle>> = {
        position: "absolute",
        left:
          cameraDeviceString == "front"
            ? -bounds.y * scalingFactors.horizontal
            : bounds.y * scalingFactors.horizontal,
        top: bounds.x * scalingFactors.vertical,
        width: bounds.width * scalingFactors.horizontal,
        height: bounds.height * scalingFactors.vertical,
        // transform: [
        //   { perspective: 1000 }, // Important for 3D rotations
        //   { rotateZ: `${rollAngle}deg` },
        //   { rotateY: `${yawAngle}deg` },
        //   { rotateX: `${pitchAngle}deg` },
        // ],
      };

      return (
        <Image
          key={i}
          source={favoritePokemon.sprite}
          style={style}
          contentFit="contain"
        />
      );
    });
    return <>{overlayElements}</>;
  };

  return (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            frameProcessor={frameProcessor}
          />
          {!!facesDetected.length && renderOverlay()}
        </>
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  );
}

export default CameraScreen;
