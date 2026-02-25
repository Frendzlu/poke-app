import "dotenv/config";

export default {
  expo: {
    name: "poke-app",
    slug: "poke-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    experiments: {
      reactCompiler: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "swm.mfrancik.poke-app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: "process.env.EXPO_PUBLIC_MAP_API_KEY",
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      package: "swm.mfrancik.pokeapp",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-maps",
        {
          requestLocationPermission: true,
          locationPermission: "Allow $(PRODUCT_NAME) to use your location",
        },
      ],
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "Allow $(PRODUCT_NAME) to use your Camera.",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.0",
          },
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
            minSdkVersion: 34,
          },
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to save your Pokemon AR photos to your gallery.",
          savePhotosPermission:
            "Allow $(PRODUCT_NAME) to save your Pokemon AR photos to your gallery.",
          isStandard: true,
        },
      ],
    ],
  },
};
