import React from "react";
import { BottomNavigation } from "react-native-paper";
import FavoritePokemonTab from "../tabs/FavoritePokemonTab";
import MapTab from "../tabs/MapTab";
import PokemonListTab from "../tabs/PokemonListTab";

const renderScene = BottomNavigation.SceneMap({
  "poke-list": PokemonListTab,
  "poke-fav": FavoritePokemonTab,
  "poke-map": MapTab,
});

const routes = [
  { key: "poke-list", title: "List of Pokemon", focusedIcon: "view-list" },
  {
    key: "poke-fav",
    title: "Favorite Pokemon",
    focusedIcon: "heart",
    unfocusedIcon: "heart-outline",
  },
  {
    key: "poke-map",
    title: "Map of Pokemon",
    focusedIcon: "map-marker",
    unfocusedIcon: "map-marker-outline",
  },
];

function TabsScreen() {
  const [index, setIndex] = React.useState(0);
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

export default TabsScreen;
