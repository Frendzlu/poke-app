import { StatusBar } from "expo-status-bar";
import React from "react";
import { FavoritePokemonProvider } from "./src/contexts/FavoritePokemonContext";
import { PokemonListProvider } from "./src/contexts/PokemonListContext";
import { BottomNavigation, PaperProvider } from "react-native-paper";
import PokemonListTab from "./src/tabs/PokemonList";
import FavoritePokemonTab from "./src/tabs/FavoritePokemon";
import CameraTab from "./src/tabs/Camera";
import MapTab from "./src/tabs/Map";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Retrieve the GraphQL schema (for development purposes)
// {
//   __type(name: "query_root") {
//     name
//     fields {
//       name
//       type {
//         name
//         kind
//       }
//     }
//   }
// }

// Full schema
// {
//   __schema {
//     types {
//       name
//       fields {
//         name
//       }
//     }
//   }
// }

const renderScene = BottomNavigation.SceneMap({
  "poke-list": PokemonListTab,
  "poke-fav": FavoritePokemonTab,
  camera: CameraTab,
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
  { key: "camera", title: "Camera", focusedIcon: "camera" },
  {
    key: "poke-map",
    title: "Map of Pokemon",
    focusedIcon: "map-marker",
    unfocusedIcon: "map-marker-outline",
  },
];

export default function App() {
  const [index, setIndex] = React.useState(0);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <PaperProvider>
          <PokemonListProvider>
            <FavoritePokemonProvider>
              <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
              />
            </FavoritePokemonProvider>
          </PokemonListProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
