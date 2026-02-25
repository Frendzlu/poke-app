import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
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
      <View style={styles.imageSurfaceContainer}>
        <Surface style={styles.imageSurface} elevation={2}>
          <Image
            source={{ uri: pokemon.sprite }}
            style={styles.image}
            contentFit="contain"
          />
        </Surface>
      </View>

      <Text
        variant="displaySmall"
        style={[styles.name, { color: accentColor }]}
      >
        {pokemon.name}
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: "#666", textAlign: "center", paddingHorizontal: 16 }}
      >
        This Pokemon has been spotted {pokemonMapOccurrences} time(s) on the
        map!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  imageSurfaceContainer: {
    width: "90%",
    aspectRatio: 1,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  imageSurface: {
    borderRadius: 24,
    width: "100%",
    height: "100%",
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
