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

function PokemonList() {
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

  const renderItem = ({ item }: { item: Pokemon }) => (
    <PokemonListComponent
      pokemon={item.toListProps()}
      setSelectedPokemon={setSelectedPokemon}
    />
  );

  const allPokemonList = Object.values(allPokemon);

  const selectedPokemon = selectedPokemonId
    ? allPokemon[selectedPokemonId]
    : undefined;

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
          snapPoints={["45%", "65%", "90%"]}
        >
          <PokemonDetails pokemon={selectedPokemon} />
        </BottomSheetWrapper>
      )}
    </SafeAreaView>
  );
}

export default PokemonList;
