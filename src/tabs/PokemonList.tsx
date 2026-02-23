import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pokemon } from "../models/Pokemon";
import PokemonListComponent from "../components/PokemonListComponent";
import { usePokemonList } from "../contexts/PokemonListContext";
import PokemonDetails from "../components/PokemonDetails";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import BottomSheetWrapper from "../components/BottomSheetWrapper";

function PokemonListTab() {
  const {
    allPokemon,
    isFetchingMore,
    isRefreshing,
    fetchMore,
    onRefresh,
    deletePokemon,
  } = usePokemonList();
  const { favoritePokemonId } = useFavoriteContext();

  const [selectedPokemonId, setSelectedPokemon] = React.useState<
    number | undefined
  >(undefined);

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <PokemonListComponent
        pokemon={item.toListProps()}
        setSelectedPokemon={setSelectedPokemon}
      />
    ),
    [],
  );

  const selectedPokemon = useMemo(() => {
    return allPokemon.find((p) => p.id === selectedPokemonId);
  }, [selectedPokemonId, allPokemon]);

  return (
    <SafeAreaView
      style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
    >
      <Text>Total Pokemon: {allPokemon?.length}</Text>
      <Button
        mode="contained"
        buttonColor="red"
        onPress={deletePokemon}
        style={{ marginBottom: 8 }}
      >
        Delete Pokemon (debug)
      </Button>
      <FlatList
        style={{ width: "90%" }}
        contentContainerStyle={{ flexGrow: 1 }}
        data={allPokemon}
        keyExtractor={(item: Pokemon) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={2}
        onEndReached={fetchMore}
        ListFooterComponent={
          isFetchingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null
        }
      />
      {selectedPokemon && (
        <BottomSheetWrapper
          tintColor={selectedPokemon.pokemonSpecies?.color || "grey"}
        >
          <PokemonDetails pokemon={selectedPokemon} />
        </BottomSheetWrapper>
      )}
    </SafeAreaView>
  );
}

export default PokemonListTab;
