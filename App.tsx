import React from "react";
import { FavoritePokemonProvider } from "./src/contexts/FavoritePokemonContext";
import { PokemonListProvider } from "./src/contexts/PokemonListContext";
import { PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";
import CameraScreen from "./src/screens/CameraScreen";
import TabsScreen from "./src/screens/TabsScreen";

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
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Portal.Host>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <PaperProvider>
            <PokemonListProvider>
              <FavoritePokemonProvider>
                <NavigationContainer>
                  <Stack.Navigator>
                    <Stack.Screen
                      name="Tabs"
                      component={TabsScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="Camera"
                      component={CameraScreen}
                      options={{ title: "Pokemon Camera" }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </FavoritePokemonProvider>
            </PokemonListProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Portal.Host>
  );
}
