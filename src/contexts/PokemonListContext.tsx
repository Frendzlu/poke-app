import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import FetchService from "../services/FetchService";
import { Pokemon } from "../models/Pokemon";

type PokemonListContextType = {
  allPokemon: Pokemon[];
  isFetchingMore: boolean;
  isRefreshing: boolean;
  fetchMore: () => void;
  onRefresh: () => void;
  deletePokemon: () => void;
};

const PokemonListContext = createContext<PokemonListContextType>({
  allPokemon: [],
  isFetchingMore: false,
  isRefreshing: false,
  fetchMore: () => {},
  onRefresh: () => {},
  deletePokemon: () => {},
});

export function PokemonListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const offsetRef = useRef(0); // TODO: Make it so that the offsetRef prevents multiple simultaneous fetches instead of relying on the isFetchingMore and isRefreshing state variables, which can

  const fetchMore = useCallback(() => {
    if (isFetchingMore || isRefreshing) return;
    setIsFetchingMore(true);
    console.log("fetching more pokemon with offset", offsetRef.current);
    FetchService.fetchPokemonList(offsetRef.current)
      .then((data) => {
        setAllPokemon((prev) => [...prev, ...data]);
        offsetRef.current += data.length;
      })
      .catch(console.error)
      .finally(() => setIsFetchingMore(false));
  }, [allPokemon.length, isFetchingMore, isRefreshing]);

  const onRefresh = useCallback(() => {
    // TODO: fix this logic - should not remove the existing pokemon
    setIsRefreshing(true);
    FetchService.fetchPokemonList(0)
      .then((data) => setAllPokemon(data))
      .catch(console.error)
      .finally(() => setIsRefreshing(false));
  }, []);

  const deletePokemon = useCallback(() => {
    FetchService.clearCache();
    offsetRef.current = 0;
    setAllPokemon([]);
  }, []);

  return (
    <PokemonListContext.Provider
      value={{
        allPokemon,
        isFetchingMore,
        isRefreshing,
        fetchMore,
        onRefresh,
        deletePokemon,
      }}
    >
      {children}
    </PokemonListContext.Provider>
  );
}

export const usePokemonList = () => useContext(PokemonListContext);
