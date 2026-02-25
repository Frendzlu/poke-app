import React from "react";
import { Surface, Text, Chip, IconButton } from "react-native-paper";
import { PokemonListItem } from "../models/Pokemon";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import Utils from "../Utils";

function PokemonListComponent(props: {
  pokemon: PokemonListItem;
  setSelectedPokemon?: (pokemonId: number) => void;
}) {
  const { favoritePokemonId, toggleFavorite } = useFavoriteContext();
  const isFavorite = props.pokemon.id === favoritePokemonId;

  return (
    <Surface style={styles.surface} elevation={4}>
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.7}
        onPress={() => props.setSelectedPokemon?.(props.pokemon.id)}
      >
        <Image source={props.pokemon.image_url} style={styles.image} />

        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.name}>
            {props.pokemon.name}
          </Text>

          <View style={styles.chipsRow}>
            {props.pokemon.types?.map((t) => (
              <Chip
                key={t}
                style={[styles.chip, { backgroundColor: Utils.typeToColor(t) }]}
                compact
              >
                {t}
              </Chip>
            ))}
          </View>
        </View>

        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          onPress={() => toggleFavorite(props.pokemon.id)}
        />
      </TouchableOpacity>
    </Surface>
  );
}

export default PokemonListComponent;

const styles = StyleSheet.create({
  surface: {
    marginVertical: 8,
    width: "100%",
    borderRadius: 8,
  },
  touchable: {
    height: 80,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    width: "100%",
    textAlign: "center",
  },
  chipsRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    marginHorizontal: 4,
  },
});
