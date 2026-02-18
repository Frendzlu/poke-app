import React from "react";
import { Surface, Text, Chip, IconButton } from "react-native-paper";
import { PokemonListItem } from "../models/Pokemon";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";

function PokemonListComponent(props: { pokemon: PokemonListItem }) {
  const { favoritePokemonId, toggleFavorite } = useFavoriteContext();
  const isFavorite = props.pokemon.id === favoritePokemonId;

  return (
    <Surface style={styles.surface} elevation={4}>
      <Image source={props.pokemon.image_url} style={styles.image} />

      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.name}>
          {props.pokemon.name}
        </Text>

        <View style={styles.chipsRow}>
          {props.pokemon.types?.map((t) => (
            <Chip key={t} style={styles.chip} compact>
              {t}
            </Chip>
          ))}
        </View>
      </View>

      <IconButton
        icon={isFavorite ? "heart" : "heart-outline"}
        onPress={() => toggleFavorite(props.pokemon.id)}
      />
    </Surface>
  );
}

export default React.memo(PokemonListComponent);

const styles = StyleSheet.create({
  surface: {
    padding: 8,
    height: 80,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
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
