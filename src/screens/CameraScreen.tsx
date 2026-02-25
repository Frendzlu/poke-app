import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageStyle,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import {
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
import Animated from "react-native-reanimated";
import { RootNavigationProp } from "../navigation/types";

function CameraScreen() {
  const cameraDeviceString = "front"; // or "front"
  const { hasPermission, requestPermission } = useCameraPermission();
  const { favoritePokemonId } = useFavoriteContext();
  const { allPokemon } = usePokemonList();
  const device = useCameraDevice(cameraDeviceString);
  const isFocused = useIsFocused();
  const [activeAppState, setActiveAppState] = useState(AppState.currentState);
  const isActive = isFocused && activeAppState === "active";
  const [facesDetected, setFacesDetected] = useState<Face[]>([]);
  const favoritePokemon = allPokemon[favoritePokemonId];
  const camera = useRef<Camera>(null);
  const navigation = useNavigation<RootNavigationProp>();

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
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setActiveAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    return () => {
      // you must call `stopListeners` when current component is unmounted
      stopListeners();
    };
  }, []);

  const handleDetectedFacesCallback = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      if (!device) return;
      const isPortraitSensor = ["portrait", "portrait-upside-down"].includes(
        device.sensorOrientation,
      );
      // console.log("faces detected", faces);
      // console.log("frame dimensions", { frameWidth, frameHeight });
      // console.log("device", {
      //   sensorOrientation: device?.sensorOrientation,
      //   name: device?.name,
      //   position: device?.position,
      // });

      let facesRemapped = faces;
      //somehow, ios has a portrait sensor orientation in landscape mode... why?
      let shouldSwapDimensions =
        (isPortraitSensor && Platform.OS === "ios") ||
        (!isPortraitSensor && Platform.OS === "android");

      if (shouldSwapDimensions) {
        facesRemapped = faces.map((face) => {
          if (Platform.OS === "android") {
            return Utils.remapFaceAndroid(face, frameWidth, frameHeight);
          }
          return Utils.remapFaceIOS(face, frameWidth, frameHeight);
        });
      } else {
        facesRemapped = faces.map((face) => {
          return Utils.remapFace(face, frameWidth, frameHeight);
        });
      }

      setFacesDetected(facesRemapped);
    },
    [device],
  );

  const handleDetectedFaces = useMemo(
    () => Worklets.createRunOnJS(handleDetectedFacesCallback),
    [handleDetectedFacesCallback],
  );

  const takePhoto = async () => {
    console.log("Taking photo...");

    if (!camera.current || !device) return;
    try {
      const photo = await camera.current.takePhoto();
      console.log("Photo taken:", photo);
      const base64 = await Utils.compositePhotoWithSprites(
        photo.path,
        favoritePokemon.sprite as string,
        facesDetected,
        device,
      );
      console.log("Composite created, saving photo...");
      await Utils.saveCapturedPhoto(base64);
      console.log("Photo saved, navigating back to map...");
      navigation.navigate("Tabs");
      // navigation.navigate("Camera");
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const faces = detectFaces(frame);
      handleDetectedFaces(faces, frame.width, frame.height);
    },
    [detectFaces, handleDetectedFaces],
  );

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Camera permission is required.</Text>
      </View>
    );
  }

  const renderOverlay = () => {
    if (!facesDetected.length) return <></>;
    let overlayElements = facesDetected.map((face, i) => {
      // console.log("face", face);
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
      // console.log("bounds", bounds);
      // console.log("preview size", previewSize);
      const faceTopLeft = Utils.shiftPointFromMiddle(
        device!.position === "front" && Platform.OS === "ios"
          ? -bounds.x
          : bounds.x,
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
      // console.log(faceTopLeft, faceWidth, faceHeight);

      const faceCenter = {
        x: faceTopLeft.x + faceWidth / 2,
        y: faceTopLeft.y + faceHeight / 2,
      };

      const foreheadOffset = -faceHeight * 0.35;

      const spriteWidth = faceHeight * 0.25;
      const spriteHeight = faceWidth * 0.25;

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
        <Animated.View
          key={i}
          style={{
            transform: [
              {
                matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 50, 1],
              },
            ],
          }}
        >
          <Image
            key={i}
            source={favoritePokemon.sprite}
            style={style}
            contentFit="contain"
          />
        </Animated.View>
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
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            photo={true}
            frameProcessor={frameProcessor}
          />
          {!!facesDetected.length && renderOverlay()}
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton} />
        </>
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: 100,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "rgba(195, 255, 0, 0.5)",
  },
});

export default CameraScreen;
