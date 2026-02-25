import { StyleSheet, Platform, Text, View } from "react-native";
import { AppleMaps, Coordinates, GoogleMaps } from "expo-maps";
import ConfirmMarkerDialog from "../components/ConfirmMarkerDialog";
import React, { useMemo, useEffect, useState } from "react";
import { usePokemonList } from "../contexts/PokemonListContext";
import Utils from "../Utils";
import { Image, ImageRef } from "expo-image";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { AppleMapsAnnotation } from "expo-maps/build/apple/AppleMaps.types";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetWrapper from "../components/BottomSheetWrapper";
import PokemonDetailsMap from "../components/PokemonDetailsMap";
import { StorageService } from "../services/StorageService";
import { Marker } from "../models/Marker";
import { GoogleMapsMarker } from "expo-maps/build/google/GoogleMaps.types";

function Map() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }

  const { allPokemon } = usePokemonList();
  const favoritePokemonId = useFavoriteContext().favoritePokemonId;

  const [visible, setVisible] = React.useState(false);
  const [markers, setMarkers] = React.useState<Marker[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = React.useState<
    Coordinates | undefined
  >(undefined);
  const [spriteRefs, setSpriteRefs] = useState<Record<number, ImageRef>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedMarker, setSelectedMarker] = useState<Marker | undefined>(
    undefined,
  );

  useEffect(() => {
    async function loadMarkers() {
      const cachedData = await StorageService.getMarkers();
      if (cachedData.length > 0) {
        setMarkers(cachedData);
      }
      setIsLoaded(true);
    }
    loadMarkers();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      StorageService.setMarkers(markers);
    }
  }, [markers, isLoaded]);

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

  const { annotations, googleMarkers } = (() => {
    if (
      !isLoaded ||
      markers.length === 0 ||
      Object.keys(allPokemon).length === 0
    ) {
      return { annotations: [], googleMarkers: [] };
    }
    return Utils.returnValidMarkers(markers, allPokemon, spriteRefs);
  })();

  const handleConfirm = () => {
    setMarkers((prev) => [
      ...prev,
      {
        lat: selectedCoordinates?.latitude,
        lon: selectedCoordinates?.longitude,
        pokemonId: favoritePokemonId,
        id: `pokemon-${favoritePokemonId}-${selectedCoordinates?.latitude}-${selectedCoordinates?.longitude}`,
      },
    ]);
    setVisible(false);
  };

  const selectedPokemonOccurrences = (() => {
    if (selectedMarker?.pokemonId === -1) return 0;
    return markers.filter((m) => m.pokemonId === selectedMarker?.pokemonId)
      .length;
  })();

  const handleAnnotationPress = (event: AppleMapsAnnotation) => {
    console.log("Annotation pressed:", event);
    console.log("All markers:", annotations);
    const marker = markers.find((m) => m.id === event.id);
    console.log("Found annotation:", marker);
    setSelectedMarker(marker);
  };

  const handleMarkerPress = (event: GoogleMapsMarker) => {
    console.log("Marker pressed:", event);
    console.log("All markers:", googleMarkers);
    const marker = markers.find((m) => m.id === event.id);
    console.log("Found marker for pressed annotation:", marker);
    setSelectedMarker(marker);
  };

  const handleMapTouch = (event: { coordinates: Coordinates }) => {
    setSelectedCoordinates(event.coordinates);
    setVisible(true);
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pressable}>
        {Platform.OS === "ios" && isLoaded && (
          <AppleMaps.View
            key="apple-map"
            style={{ flex: 1 }}
            onMapLongPress={handleMapTouch}
            annotations={annotations}
            onAnnotationClick={handleAnnotationPress}
          />
        )}
        {Platform.OS === "android" && isLoaded && (
          <GoogleMaps.View
            key="google-map"
            style={{ flex: 1 }}
            onMapLongClick={handleMapTouch}
            markers={googleMarkers}
            onMarkerClick={handleMarkerPress}
          />
        )}
      </View>
      <ConfirmMarkerDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        onConfirm={handleConfirm}
      />
      {selectedMarker && (
        <BottomSheetWrapper
          tintColor={
            allPokemon[selectedMarker.pokemonId]?.pokemonSpecies.color || "grey"
          }
          snapPoints={["65%"]}
        >
          <PokemonDetailsMap
            pokemon={allPokemon[selectedMarker.pokemonId]}
            pokemonMapOccurrences={selectedPokemonOccurrences}
          />
        </BottomSheetWrapper>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});

export default Map;
