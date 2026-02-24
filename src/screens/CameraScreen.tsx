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
  LayoutChangeEvent,
  Platform,
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
import Utils from "../Utils";

function CameraScreen() {
  const cameraDeviceString = "front"; // or "front"
  const { hasPermission, requestPermission } = useCameraPermission();
  const { favoritePokemonId } = useFavoriteContext();
  const { allPokemon } = usePokemonList();
  const device = useCameraDevice(cameraDeviceString);
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const isActive = isFocused && appState.current === "active";
  const [facesDetected, setFacesDetected] = useState<Face[]>([]);
  const favoritePokemon = allPokemon[favoritePokemonId];
  const [layout, setLayout] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    // detection options
  }).current;

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  // const { width, height } = Dimensions.get("window");

  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

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
      const isPortraitSensor = ["portrait", "portrait-upside-down"].includes(
        device!.sensorOrientation,
      );
      console.log("faces detected", faces);
      console.log("frame dimensions", { frameWidth, frameHeight });
      console.log("device", {
        sensorOrientation: device?.sensorOrientation,
        name: device?.name,
        position: device?.position,
      });

      let facesRemapped = faces;
      //somehow, ios has a portrait sensor orientation in landscape mode... why?
      let shouldSwapDimensions =
        (isPortraitSensor && Platform.OS === "ios") ||
        (!isPortraitSensor && Platform.OS === "android");

      if (shouldSwapDimensions) {
        // remember to swap width and height
        // and recalculate the coord system to be top-left based instead of top right (top left for landscape)
        facesRemapped = faces.map((face) => {
          const faceTopLeftX = face.bounds.y + face.bounds.height; // y is the horizontal distance from right edge
          const faceTopLeftY = face.bounds.x;
          console.log("corrected top left", { faceTopLeftX, faceTopLeftY });
          const faceTopLeft = Utils.shiftPointToMiddle(
            faceTopLeftX,
            faceTopLeftY,
            frameHeight, //this is the width in landscape
            frameWidth, //this is the height in landscape
          );
          console.log("face top left shifted to middle", faceTopLeft);

          return {
            ...face,
            bounds: {
              height: Utils.getRelativeLength(face.bounds.height, frameWidth),
              width: Utils.getRelativeLength(face.bounds.width, frameHeight),
              x: faceTopLeft.x,
              y: faceTopLeft.y,
            },
          };
        });
      } else {
        facesRemapped = faces.map((face) => {
          const faceTopLeft = Utils.shiftPointToMiddle(
            face.bounds.x,
            face.bounds.y,
            frameWidth,
            frameHeight,
          );

          return {
            ...face,
            bounds: {
              width: Utils.getRelativeLength(face.bounds.width, frameWidth),
              height: Utils.getRelativeLength(face.bounds.height, frameHeight),
              x: faceTopLeft.x,
              y: faceTopLeft.y,
            },
          };
        });
      }

      setLayout({
        scale: Math.max(
          frameWidth / previewSize.width,
          frameHeight / previewSize.height,
        ),
        offsetX: 0,
        offsetY: 0,
      });

      setFacesDetected(facesRemapped);
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
      // if (
      //   device!.sensorOrientation === "portrait" ||
      //   device!.sensorOrientation === "portrait-upside-down"
      // ) {
      //   bounds.width = face.bounds.height;
      //   bounds.x = face.bounds.y;
      //   bounds.y = face.bounds.x;
      //   bounds.height = face.bounds.width;
      // }
      console.log("bounds", bounds);
      console.log("preview size", previewSize);
      const faceTopLeft = Utils.shiftPointFromMiddle(
        device!.position === "front" ? -bounds.x : bounds.x,
        bounds.y,
        previewSize.width,
        previewSize.height,
      );
      const faceHeight = Utils.getAbsoluteLength(
        bounds.height,
        previewSize.height,
      );
      const faceWidth = Utils.getAbsoluteLength(
        bounds.width,
        previewSize.width,
      );
      console.log(faceTopLeft, faceWidth, faceHeight);

      const faceCenter = {
        x: faceTopLeft.x + faceWidth / 2,
        y: faceTopLeft.y + faceHeight / 2,
      };

      const foreheadOffset = -faceHeight * 0.35;

      // const spriteCenter = Utils.rotatePointAroundCenter(
      //   {
      //     x: faceCenter.x - faceWidth * 0.15,
      //     y: faceCenter.y - faceHeight * 0.6,
      //   },
      //   faceCenter,
      //   rollAngle,
      // );

      const spriteWidth = faceHeight * 0.25;
      const spriteHeight = faceWidth * 0.25;

      // console.log({
      //   spriteHeight,
      //   spriteWidth,
      //   faceCenter,
      //   spriteCenter,
      // });

      const safePitch = Math.max(Math.min(pitchAngle || 0, 60), -60);
      const safeYaw = Math.max(Math.min(yawAngle || 0, 60), -60);

      const style: Partial<StyleProp<ImageStyle>> = {
        position: "absolute",
        left: faceCenter.x,
        top: faceCenter.y,
        width: spriteWidth,
        height: spriteHeight,
        overflow: "visible",
        backfaceVisibility: "hidden",
        zIndex: 100,
        transform: [
          { perspective: 300 },
          { translateX: -spriteWidth / 2 },
          { translateY: -spriteHeight / 2 },
          { rotateZ: `${rollAngle || 0}deg` },
          { rotateY: `${safeYaw}deg` },
          { rotateX: `${safePitch}deg` },
          { translateY: foreheadOffset },
          { scale: 2 },
        ],
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
    <View
      style={{ flex: 1, backfaceVisibility: "hidden", overflow: "visible" }}
      onLayout={onLayout}
    >
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
