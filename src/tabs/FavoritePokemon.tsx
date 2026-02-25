import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";
import PokemonDetails from "../components/PokemonDetails";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { useMemo } from "react";
import { usePokemonList } from "../contexts/PokemonListContext";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "../navigation/types";
import FetchService from "../services/FetchService";

function FavoritePokemon() {
  const { favoritePokemonId, toggleFavorite } = useFavoriteContext();
  const { allPokemon } = usePokemonList();
  const navigation = useNavigation<RootNavigationProp>();
  const favoritePokemon =
    favoritePokemonId === -1 ? undefined : allPokemon[favoritePokemonId];

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
        style={styles.fabDelete}
        onPress={() => toggleFavorite(favoritePokemonId)}
      />
      <FAB
        icon="camera"
        label="Take a picture"
        style={styles.fabCamera}
        onPress={() => navigation.navigate("Camera")}
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
  fabDelete: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
  fabCamera: {
    position: "absolute",
    left: 16,
    bottom: 24,
  },
});

export default FavoritePokemon;
