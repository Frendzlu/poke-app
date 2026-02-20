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
  const favoritePokemonId = useFavoriteContext().favoritePokemonId;

  const [selectedPokemonId, setSelectedPokemon] = React.useState<number | null>(
    null,
  );

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <PokemonListComponent
        pokemon={item.toListProps()}
        setSelectedPokemon={setSelectedPokemon}
      />
    ),
    [],
  );

  const allPokemonList = useMemo(() => Object.values(allPokemon), [allPokemon]);

  const selectedPokemon = useMemo(() => {
    return selectedPokemonId !== null
      ? allPokemon[selectedPokemonId]
      : undefined;
  }, [selectedPokemonId, allPokemon]);

  return (
    <SafeAreaView
      style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
    >
      <Text>Total Pokemon: {Object.keys(allPokemon).length}</Text>
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
        data={allPokemonList}
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
