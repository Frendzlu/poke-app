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

export type PokemonDictionary = Record<number, Pokemon>;

type PokemonListContextType = {
  allPokemon: PokemonDictionary;
  isFetchingMore: boolean;
  isRefreshing: boolean;
  fetchMore: () => void;
  onRefresh: () => void;
  deletePokemon: () => void;
  fetchById: (id: number) => Promise<Pokemon>;
};

const PokemonListContext = createContext<PokemonListContextType>({
  allPokemon: {},
  isFetchingMore: false,
  isRefreshing: false,
  fetchMore: () => {},
  onRefresh: () => {},
  deletePokemon: () => {},
  fetchById: () => Promise.resolve({} as Pokemon),
});

export function PokemonListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allPokemon, setAllPokemon] = useState<PokemonDictionary>({});
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const offsetRef = useRef(0); // TODO: Make it so that the offsetRef prevents multiple simultaneous fetches instead of relying on the isFetchingMore and isRefreshing state variables, which can

  const fetchMore = useCallback(() => {
    if (isFetchingMore || isRefreshing) return;
    setIsFetchingMore(true);
    console.log("fetching more pokemon with offset", offsetRef.current);
    FetchService.fetchPokemonList(offsetRef.current)
      .then((data) => {
        setAllPokemon((prev) => {
          const next = { ...prev };
          data.forEach((p: Pokemon) => {
            next[p.id] = p;
          });
          return next;
        });
        offsetRef.current += data.length;
      })
      .catch(console.error)
      .finally(() => setIsFetchingMore(false));
  }, [Object.keys(allPokemon).length, isFetchingMore, isRefreshing]);

  const fetchById = useCallback((id: number) => {
    return FetchService.fetchPokemonById(id).then((pokemon) => {
      setAllPokemon((prev) => ({ ...prev, [pokemon.id]: pokemon }));
      return pokemon;
    });
  }, []);

  const onRefresh = useCallback(() => {
    // TODO: fix this logic - should not remove the existing pokemon
    setIsRefreshing(true);
    FetchService.fetchPokemonList(0)
      .then((data) => {
        const dict: PokemonDictionary = {};
        data.forEach((p: Pokemon) => {
          dict[p.id] = p;
        });
        setAllPokemon(dict);
      })
      .catch(console.error)
      .finally(() => setIsRefreshing(false));
  }, []);

  const deletePokemon = useCallback(() => {
    FetchService.clearCache();
    offsetRef.current = 0;
    setAllPokemon({});
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
        fetchById,
      }}
    >
      {children}
    </PokemonListContext.Provider>
  );
}

export const usePokemonList = () => useContext(PokemonListContext);
