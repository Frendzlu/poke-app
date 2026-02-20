import { StyleSheet, Platform, Text, View } from "react-native";
import { AppleMaps, Coordinates, GoogleMaps } from "expo-maps";
import ConfirmMarkerDialog from "../components/ConfirmMarkerDialog";
import React, { useMemo, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePokemonList } from "../contexts/PokemonListContext";
import Utils from "../Utils";
import { Image, ImageRef } from "expo-image";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { AppleMapsAnnotation } from "expo-maps/build/apple/AppleMaps.types";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetWrapper from "../components/BottomSheetWrapper";
import PokemonDetailsMap from "../components/PokemonDetailsMap";
import FetchService from "../services/FetchService";

const MARKERS_KEY = "markers";
export interface Marker {
  lat?: number;
  lon?: number;
  pokemonId: number;
}

function MapTab() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }

  const { allPokemon, fetchById } = usePokemonList();
  const favoritePokemonId = useFavoriteContext().favoritePokemonId;
  useEffect(() => {
    if (favoritePokemonId !== -1 && !allPokemon[favoritePokemonId]) {
      fetchById(favoritePokemonId);
    }
  }, [favoritePokemonId, allPokemon]);

  const [visible, setVisible] = React.useState(false);
  const [markers, setMarkers] = React.useState<Marker[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] =
    React.useState<Coordinates | null>(null);
  const [spriteRefs, setSpriteRefs] = useState<Record<number, ImageRef>>({});

  useEffect(() => {
    async function loadMarkers() {
      const cachedData = await AsyncStorage.getItem(MARKERS_KEY);

      if (cachedData) {
        setMarkers(JSON.parse(cachedData));
      }
    }
    loadMarkers();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(MARKERS_KEY, JSON.stringify(markers));
  }, [markers]);

  // Load sprite images for all markers' pokemon
  useEffect(() => {
    let cancelled = false;

    async function loadSprites() {
      const pokemonIds = [
        ...new Set(
          markers
            .map((m) => m.pokemonId)
            .filter((id) => allPokemon[id] && !spriteRefs[id]),
        ),
      ];

      if (pokemonIds.length === 0) return;

      const newRefs: Record<number, ImageRef> = {};
      await Promise.all(
        pokemonIds.map(async (id) => {
          try {
            const ref = await Image.loadAsync(allPokemon[id].sprite, {
              maxWidth: 50,
              maxHeight: 50,
            });
            if (!cancelled) {
              newRefs[id] = ref;
            }
          } catch (e) {
            console.warn(`Failed to load sprite for pokemon ${id}:`, e);
          }
        }),
      );

      if (!cancelled && Object.keys(newRefs).length > 0) {
        setSpriteRefs((prev) => ({ ...prev, ...newRefs }));
      }
    }

    loadSprites();
    return () => {
      cancelled = true;
    };
  }, [markers, allPokemon]);

  const { annotations, googleMarkers } = useMemo(() => {
    console.log("Computing valid markers for map display...");
    console.log("Current markers:", markers);
    const result = Utils.returnValidMarkers(markers, allPokemon, spriteRefs);
    console.log(
      "Markers with valid Pokemon:",
      Platform.OS === "ios" ? result.annotations : result.googleMarkers,
    );
    return result;
  }, [markers, allPokemon, spriteRefs]);

  const handleConfirm = () => {
    console.log(
      "Marker confirmed! [lat, lon]:",
      selectedCoordinates?.latitude,
      selectedCoordinates?.longitude,
    );
    setMarkers((prev) => [
      ...prev,
      {
        lat: selectedCoordinates?.latitude,
        lon: selectedCoordinates?.longitude,
        pokemonId: favoritePokemonId,
      },
    ]);
    setVisible(false);
  };

  const favoritePokemonOccurrences = useMemo(() => {
    if (favoritePokemonId === -1) return 0;
    return markers.filter((m) => m.pokemonId === favoritePokemonId).length;
  }, [markers, favoritePokemonId]);

  const handleAnnotationPress = (event: AppleMapsAnnotation) => {
    console.log("Annotation pressed:", event);
  };

  const handleMapTouch = (event: { coordinates: Coordinates }) => {
    console.log(
      `Map touched at [lat, lon]: ${event.coordinates.latitude}, ${event.coordinates.longitude}`,
    );
    setSelectedCoordinates(event.coordinates);
    setVisible(true);
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pressable}>
        {Platform.OS === "ios" && (
          <AppleMaps.View
            style={{ flex: 1 }}
            onMapLongPress={handleMapTouch}
            annotations={annotations}
            onAnnotationClick={handleAnnotationPress}
          />
        )}
        {Platform.OS === "android" && (
          <GoogleMaps.View
            style={{ flex: 1 }}
            onMapLongClick={handleMapTouch}
            markers={googleMarkers}
          />
        )}
      </View>
      <ConfirmMarkerDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        onConfirm={handleConfirm}
      />
      ()
      <BottomSheetWrapper
        tintColor={
          favoritePokemonId !== -1
            ? allPokemon[favoritePokemonId]?.pokemonSpecies.color || "grey"
            : "grey"
        }
        snapPoints={["5%", "45%", "65%", "90%"]}
      >
        <PokemonDetailsMap
          pokemon={allPokemon[favoritePokemonId]}
          pokemonMapOccurrences={favoritePokemonOccurrences}
        />
      </BottomSheetWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});

export default MapTab;
