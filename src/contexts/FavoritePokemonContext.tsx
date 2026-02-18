import React, { createContext, useCallback, useContext, useState } from "react";

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

  const toggleFavorite = useCallback((id: number) => {
    setFavoritePokemonId((prev) => (prev === id ? -1 : id));
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
