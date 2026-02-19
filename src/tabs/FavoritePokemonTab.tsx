import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";
import PokemonDetails from "../components/PokemonDetails";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { useMemo } from "react";
import { usePokemonList } from "../contexts/PokemonListContext";

function FavoritePokemonTab() {
  const { favoritePokemonId, toggleFavorite } = useFavoriteContext();
  const allPokemon = usePokemonList().allPokemon;
  const favoritePokemon = useMemo(
    () => allPokemon.find((p) => p.id === favoritePokemonId),
    [allPokemon, favoritePokemonId],
  );

  if (favoritePokemonId === -1) {
    return (
      <View style={styles.empty}>
        <Text>No favorite Pokemon selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <PokemonDetails pokemon={favoritePokemon!} />
      </ScrollView>
      <FAB
        icon="heart-remove"
        label="Unfavorite"
        style={styles.fab}
        onPress={() => toggleFavorite(favoritePokemonId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    margin: 16,
    marginTop: "10%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
});

export default FavoritePokemonTab;
