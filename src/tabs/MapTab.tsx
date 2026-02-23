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

export type { Marker };

function MapTab() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }

  const { allPokemon } = usePokemonList();
  const favoritePokemonId = useFavoriteContext().favoritePokemonId;

  const [visible, setVisible] = React.useState(false);
  const [markers, setMarkers] = React.useState<Marker[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] =
    React.useState<Coordinates | null>(null);
  const [spriteRefs, setSpriteRefs] = useState<Record<number, ImageRef>>({});

  useEffect(() => {
    async function loadMarkers() {
      const cachedData = await StorageService.getMarkers();
      if (cachedData.length > 0) {
        setMarkers(cachedData);
      }
    }
    loadMarkers();
  }, []);

  useEffect(() => {
    StorageService.setMarkers(markers);
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
    const result = Utils.returnValidMarkers(markers, allPokemon, spriteRefs);
    return result;
  }, [markers, allPokemon, spriteRefs]);

  const handleConfirm = () => {
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
      (allPokemon[favoritePokemonId] &&
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
      )
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});

export default MapTab;
