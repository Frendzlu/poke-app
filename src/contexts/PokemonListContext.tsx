import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import FetchService from "../services/FetchService";
import { StorageService } from "../services/StorageService";
import { Pokemon } from "../models/Pokemon";

export type PokemonDictionary = Record<number, Pokemon>;

type PokemonListContextType = {
  allPokemon: PokemonDictionary;
  isFetchingMore: boolean;
  isRefreshing: boolean;
  fetchMore: () => void;
  onRefresh: () => void;
  deletePokemon: () => void;
  ensurePokemonLoaded: (ids: number[]) => Promise<void>;
};

const PokemonListContext = createContext<PokemonListContextType>({
  allPokemon: {},
  isFetchingMore: false,
  isRefreshing: false,
  fetchMore: () => {},
  onRefresh: () => {},
  deletePokemon: () => {},
  ensurePokemonLoaded: () => Promise.resolve(),
});

export function PokemonListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allPokemon, setAllPokemon] = useState<PokemonDictionary>({});
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const offsetRef = useRef(0);

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

  const ensurePokemonLoaded = useCallback(async (ids: number[]) => {
    setAllPokemon((prev) => {
      const missing = ids.filter((id) => !prev[id]);
      if (missing.length === 0) return prev;

      FetchService.fetchPokemonByIds(missing)
        .then((fetched) => {
          setAllPokemon((current) => {
            const next = { ...current };
            fetched.forEach((p) => {
              next[p.id] = p;
            });
            return next;
          });
        })
        .catch((e) =>
          console.error("ensurePokemonLoaded: failed to fetch", missing, e),
        );

      return prev; // optimistic — don't block render
    });
  }, []);

  const onRefresh = useCallback(() => {
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
    StorageService.clearPokemonCache();
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
        ensurePokemonLoaded,
      }}
    >
      {children}
    </PokemonListContext.Provider>
  );
}

export const usePokemonList = () => useContext(PokemonListContext);
