import React, { useEffect } from "react";
import { FavoritePokemonProvider } from "./src/contexts/FavoritePokemonContext";
import {
  PokemonListProvider,
  usePokemonList,
} from "./src/contexts/PokemonListContext";
import { PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";
import CameraScreen from "./src/screens/CameraScreen";
import TabsScreen from "./src/screens/TabsScreen";
import { StorageService } from "./src/services/StorageService";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppBootDataRequester({ children }: { children: React.ReactNode }) {
  const { ensurePokemonLoaded } = usePokemonList();

  useEffect(() => {
    async function onBoot() {
      const [favoriteId, markers] = await Promise.all([
        StorageService.getFavoriteId(),
        StorageService.getMarkers(),
      ]);

      const requiredIds = new Set<number>();
      if (favoriteId !== -1) requiredIds.add(favoriteId);
      markers.forEach((m) => requiredIds.add(m.pokemonId));

      if (requiredIds.size > 0) {
        await ensurePokemonLoaded([...requiredIds]);
      }
    }
    onBoot().catch(console.error);
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <Portal.Host>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <PaperProvider>
            <PokemonListProvider>
              <FavoritePokemonProvider>
                <AppBootDataRequester>
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
                </AppBootDataRequester>
              </FavoritePokemonProvider>
            </PokemonListProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Portal.Host>
  );
}
