import { View, Image, StyleSheet } from "react-native";
import { Text, Surface, Chip } from "react-native-paper";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { Pokemon } from "../models/Pokemon";
import Utils from "../Utils";
import Color from "color";

function PokemonDetailsMap({
  pokemon,
  pokemonMapOccurrences,
}: {
  pokemon: Pokemon;
  pokemonMapOccurrences: number;
}) {
  const baseColor = Color(pokemon.pokemonSpecies.color);
  const accentColor = baseColor.darken(0.3).hex();

  return (
    <View style={[styles.content]}>
      <Surface style={styles.imageSurface} elevation={2}>
        <Image
          source={{ uri: pokemon.sprite }}
          style={styles.image}
          resizeMode="contain"
        />
      </Surface>

      <Text
        variant="displaySmall"
        style={[styles.name, { color: accentColor }]}
      >
        {pokemon.name}
      </Text>
      <Text variant="bodyMedium" style={{ color: "#888" }}>
        Seen on map: {pokemonMapOccurrences} time
        {pokemonMapOccurrences !== 1 ? "s" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: "transparent",
  },
  imageSurface: {
    borderRadius: 24,
    overflow: "hidden",
    width: "90%",
    height: "90%",
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PokemonDetailsMap;
