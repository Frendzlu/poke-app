import { SkCanvas } from "./../node_modules/@shopify/react-native-skia/lib/commonjs/skia/types/Canvas.d";
import { Marker } from "./models/Marker";
import { PokemonDictionary } from "./contexts/PokemonListContext";
import { Platform } from "react-native";
import { AppleMapsAnnotation } from "expo-maps/build/apple/AppleMaps.types";
import { GoogleMapsMarker } from "expo-maps/build/google/GoogleMaps.types";
import { ImageRef } from "expo-image";
import { File } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Face } from "react-native-vision-camera-face-detector";
import { Skia, SkImage } from "@shopify/react-native-skia";
import { CameraDevice } from "react-native-vision-camera";
import { Directory, Paths } from "expo-file-system";

export type PlatformMarker = AppleMapsAnnotation | GoogleMapsMarker;

export default class Utils {
  static kebabToTitleCase(str: string) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // TODO: make it return 2 colors - background and text color - white on yellow is not visible, black on brown the same
  static typeToColor(type: string): string {
    const TYPE_COLORS: Record<string, string> = {
      normal: "#A8A77A",
      fire: "#EE8130",
      water: "#6390F0",
      electric: "#F7D02C",
      grass: "#7AC74C",
      ice: "#96D9D6",
      fighting: "#C22E28",
      poison: "#A33EA1",
      ground: "#E2BF65",
      flying: "#A98FF3",
      psychic: "#F95587",
      bug: "#A6B91A",
      rock: "#B6A136",
      ghost: "#735797",
      dragon: "#6F35FC",
      dark: "#705746",
      steel: "#B7B7CE",
      fairy: "#D685AD",
    };
    return TYPE_COLORS[type] ?? "#888";
  }

  static returnValidMarkers(
    markers: Marker[],
    allPokemon: PokemonDictionary,
    spriteRefs: Record<number, ImageRef>,
  ): { annotations: AppleMapsAnnotation[]; googleMarkers: GoogleMapsMarker[] } {
    const annotations: AppleMapsAnnotation[] = [];
    const googleMarkers: GoogleMapsMarker[] = [];

    for (const marker of markers) {
      if (marker.lat == null || marker.lon == null) continue;
      const pokemon = allPokemon[marker.pokemonId];
      if (!pokemon) continue;

      const coords = {
        latitude: marker.lat,
        longitude: marker.lon,
      };
      const spriteRef = spriteRefs[pokemon.id];
      const markerId = marker.id || `pkm-${pokemon.id}-at-${Date.now()}`;

      if (Platform.OS === "ios") {
        annotations.push({
          coordinates: coords,
          title: pokemon.name,
          text: spriteRef ? "" : `#${pokemon.id}`,
          backgroundColor: pokemon.pokemonSpecies.color,
          textColor: "white",
          id: markerId,
          icon: spriteRef,
        });
      } else {
        googleMarkers.push({
          id: markerId,
          coordinates: coords,
          title: pokemon.name,
          icon: spriteRef,
        });
      }
    }

    return { annotations, googleMarkers };
  }

  static shiftPointToMiddle(
    pointX: number,
    pointY: number,
    elementWidth: number,
    elementHeight: number,
  ): { x: number; y: number } {
    let shiftedX = pointX - elementWidth / 2;
    let shiftedY = pointY - elementHeight / 2;
    return {
      x: (shiftedX * 2) / elementWidth,
      y: (shiftedY * 2) / elementHeight,
    };
  }

  static shiftPointFromMiddle(
    pointX: number,
    pointY: number,
    elementWidth: number,
    elementHeight: number,
  ): { x: number; y: number } {
    let pixelX = (pointX * elementWidth) / 2;
    let pixelY = (pointY * elementHeight) / 2;
    return {
      x: pixelX + elementWidth / 2,
      y: pixelY + elementHeight / 2,
    };
  }

  static getRelativeLength(
    absoluteLength: number,
    referenceLength: number,
  ): number {
    return (absoluteLength / referenceLength) * 2;
  }

  static getAbsoluteLength(
    relativeLength: number,
    referenceLength: number,
  ): number {
    return (relativeLength / 2) * referenceLength;
  }

  static remapFaceAndroid(
    face: Face,
    frameWidth: number,
    frameHeight: number,
  ): Face {
    let faceTopLeftX = frameHeight - face.bounds.x - face.bounds.height; // y is the horizontal distance from right edge
    let faceTopLeftY = face.bounds.y;
    face.bounds.y = faceTopLeftY;
    face.bounds.x = faceTopLeftX;
    return Utils.remapFace(face, frameWidth, frameHeight);
  }

  static remapFaceIOS(
    face: Face,
    frameWidth: number,
    frameHeight: number,
  ): Face {
    let faceTopLeftX = face.bounds.y + face.bounds.height; // y is the horizontal distance from right edge
    let faceTopLeftY = face.bounds.x;
    face.bounds.y = faceTopLeftY;
    face.bounds.x = faceTopLeftX;
    return Utils.remapFace(face, frameWidth, frameHeight);
  }

  static async saveCapturedPhoto(base64Data: string): Promise<void> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to save photos is required!");
      return;
    }

    const directory = new Directory(Paths.cache, "poke_images");
    if (!directory.exists) {
      directory.create();
    }

    const filename = `pokemon_ar_${Date.now()}.png`;
    const file = new File(directory, filename);

    // Decode base64 → binary and write as bytes so the saved file is a valid PNG.
    // Use file.write() (synchronous) instead of writableStream() — the stream
    // API doesn't guarantee the file is flushed before createAssetAsync runs.
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    file.write(bytes);

    const asset = await MediaLibrary.createAssetAsync(file.uri);
    await MediaLibrary.createAlbumAsync("PokemonAR", asset, false);
    console.log("Photo saved to gallery:", asset.uri);
  }

  static async compositePhotoWithSprites(
    photoPath: string,
    spriteUrl: string,
    facesDetected: Face[],
    device: CameraDevice,
  ): Promise<string> {
    const photoResponse = await fetch(`file://${photoPath}`);
    const photoData = Skia.Data.fromBytes(
      new Uint8Array(await photoResponse.arrayBuffer()),
    );
    const cameraImage = Skia.Image.MakeImageFromEncoded(photoData);
    if (!cameraImage) throw new Error("Failed to decode camera image");

    const photoWidth = cameraImage.width();
    const photoHeight = cameraImage.height();

    const spriteResponse = await fetch(spriteUrl);
    const spriteData = Skia.Data.fromBytes(
      new Uint8Array(await spriteResponse.arrayBuffer()),
    );
    const pokemonImage = Skia.Image.MakeImageFromEncoded(spriteData);

    const surface = Skia.Surface.Make(photoWidth, photoHeight);
    if (!surface) throw new Error("Failed to create Skia surface");
    let skCanvas = surface.getCanvas();

    skCanvas.drawImage(cameraImage, 0, 0);

    if (pokemonImage && facesDetected.length > 0) {
      skCanvas = Utils.handleDetectedFacesAndDrawSprites(
        facesDetected,
        device,
        photoWidth,
        photoHeight,
        skCanvas,
        pokemonImage,
      );
    }

    return surface.makeImageSnapshot().encodeToBase64();
  }

  static remapFace(face: Face, frameWidth: number, frameHeight: number): Face {
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
  }

  static handleDetectedFacesAndDrawSprites(
    facesDetected: Face[],
    device: CameraDevice,
    photoWidth: number,
    photoHeight: number,
    skCanvas: SkCanvas,
    pokemonImage: SkImage,
  ): SkCanvas {
    const PERSPECTIVE = 300;

    for (const face of facesDetected) {
      const { bounds, rollAngle, yawAngle, pitchAngle } = face;
      const faceTopLeft = Utils.shiftPointFromMiddle(
        device!.position === "front" && Platform.OS === "ios"
          ? -bounds.x
          : bounds.x,
        bounds.y,
        photoWidth,
        photoHeight,
      );
      const faceHeight = Utils.getAbsoluteLength(bounds.height, photoHeight);
      const faceWidth = Utils.getAbsoluteLength(bounds.width, photoWidth);
      const spriteW = faceHeight * 0.25 * 2;
      const spriteH = faceWidth * 0.25 * 2;
      const faceCenter = {
        x: faceTopLeft.x + faceWidth / 2,
        y: faceTopLeft.y + faceHeight / 2,
      };
      const foreheadOffset = -faceHeight * 0.35;

      const safeYaw = Math.max(Math.min(yawAngle || 0, 60), -60);
      const safePitch = Math.max(Math.min(pitchAngle || 0, 60), -60);
      const yawRad = (safeYaw * Math.PI) / 180;
      const pitchRad = (safePitch * Math.PI) / 180;

      const paint = Skia.Paint();
      const srcRect = {
        x: 0,
        y: 0,
        width: pokemonImage.width(),
        height: pokemonImage.height(),
      };

      const localRect = {
        x: -spriteW / 2,
        y: -spriteH / 2 + foreheadOffset,
        width: spriteW,
        height: spriteH,
      };

      skCanvas.save();
      skCanvas.translate(faceCenter.x, faceCenter.y);
      skCanvas.rotate(rollAngle || 0, 0, 0);
      skCanvas.concat(
        Skia.Matrix([
          Math.cos(yawRad),
          0,
          0,
          0,
          1,
          0,
          -Math.sin(yawRad) / PERSPECTIVE,
          0,
          1,
        ]),
      );

      skCanvas.concat(
        Skia.Matrix([
          1,
          0,
          0,
          0,
          Math.cos(pitchRad),
          0,
          0,
          -Math.sin(pitchRad) / PERSPECTIVE,
          1,
        ]),
      );

      skCanvas.scale(2, 2);
      skCanvas.drawImageRect(pokemonImage, srcRect, localRect, paint);
      skCanvas.restore();
    }
    return skCanvas;
  }
}
