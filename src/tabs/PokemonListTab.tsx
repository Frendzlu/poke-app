import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pokemon } from "../models/Pokemon";
import PokemonListComponent from "../components/PokemonListComponent";
import { usePokemonList } from "../contexts/PokemonListContext";

function PokemonListTab() {
  const {
    allPokemon,
    isFetchingMore,
    isRefreshing,
    fetchMore,
    onRefresh,
    deletePokemon,
  } = usePokemonList();

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <PokemonListComponent pokemon={item.toListProps()} />
    ),
    [],
  );

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
    </SafeAreaView>
  );
}

export default PokemonListTab;
