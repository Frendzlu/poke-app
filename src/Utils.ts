import { Marker } from "./models/Marker";
import { PokemonDictionary } from "./contexts/PokemonListContext";
import { Platform } from "react-native";
import { AppleMapsAnnotation } from "expo-maps/build/apple/AppleMaps.types";
import { GoogleMapsMarker } from "expo-maps/build/google/GoogleMaps.types";
import { ImageRef } from "expo-image";

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

  static rotatePointAroundCenter(
    point: { x: number; y: number },
    center: { x: number; y: number },
    rotationAngle: number,
  ): { x: number; y: number } {
    const { x: pointX, y: pointY } = point;
    const { x: centerX, y: centerY } = center;
    const angleRadians = (rotationAngle * Math.PI) / 180;
    const cosTheta = Math.cos(angleRadians);
    const sinTheta = Math.sin(angleRadians);

    const translatedX = pointX - centerX;
    const translatedY = pointY - centerY;

    const rotatedX = translatedX * cosTheta - translatedY * sinTheta + centerX;
    const rotatedY = translatedX * sinTheta + translatedY * cosTheta + centerY;

    return { x: rotatedX, y: rotatedY };
  }
}
