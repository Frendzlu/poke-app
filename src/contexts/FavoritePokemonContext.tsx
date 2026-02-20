import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { StorageService } from "../services/StorageService";

interface FavoritePokemonContextType {
  favoritePokemonId: number;
  toggleFavorite: (id: number) => void;
}

const FavoritePokemonContext = createContext<FavoritePokemonContextType>({
  favoritePokemonId: -1,
  toggleFavorite: () => {},
});

export function FavoritePokemonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoritePokemonId, setFavoritePokemonId] = useState<number>(-1);

  // Restore persisted favorite on mount
  useEffect(() => {
    StorageService.getFavoriteId().then((id) => {
      if (id !== -1) setFavoritePokemonId(id);
    });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavoritePokemonId((prev) => {
      const next = prev === id ? -1 : id;
      StorageService.setFavoriteId(next);
      return next;
    });
  }, []);

  return (
    <FavoritePokemonContext.Provider
      value={{ favoritePokemonId, toggleFavorite }}
    >
      {children}
    </FavoritePokemonContext.Provider>
  );
}

export const useFavoriteContext = () => useContext(FavoritePokemonContext);
