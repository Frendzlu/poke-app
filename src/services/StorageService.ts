import AsyncStorage from "@react-native-async-storage/async-storage";
import { Marker } from "../models/Marker";

export const STORAGE_KEYS = {
  POKEMON_CACHE: "pokemon_list_cache",
  FAVORITE_ID: "favorite_pokemon_id",
  MARKERS: "markers",
} as const;

export class StorageService {

  static async getPokemonCache(): Promise<any[] | null> {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.POKEMON_CACHE);
    return cached ? JSON.parse(cached) : null;
  }

  static async setPokemonCache(data: any[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.POKEMON_CACHE,
      JSON.stringify(data),
    );
  }

  static async clearPokemonCache(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.POKEMON_CACHE);
  }

  static async getFavoriteId(): Promise<number> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ID);
    return stored !== null ? parseInt(stored, 10) : -1;
  }

  static async setFavoriteId(id: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ID, String(id));
  }


  static async getMarkers(): Promise<Marker[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MARKERS);
    return stored ? JSON.parse(stored) : [];
  }

  static async setMarkers(markers: Marker[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.MARKERS,
      JSON.stringify(markers),
    );
  }

  static async clearMarkers(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.MARKERS);
  }
}
