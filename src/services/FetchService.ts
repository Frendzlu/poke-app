import { Pokemon } from "../models/Pokemon";
import { StorageService } from "./StorageService";

export default class FetchService {

    static async fetchPokemonList(offset: number = 0) {
        try {
            if (offset === 0) {
                const cachedData = await StorageService.getPokemonCache();
                if (cachedData) {
                    console.log("Using cached Pokemon list");
                    return cachedData.map((poke: any) => new Pokemon(poke));
                }
            }
            const response = await fetch(process.env.EXPO_PUBLIC_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: this.getQueryWithPagination(40, offset) }),
            });
            const json = await response.json();
            if (offset === 0) {
                await StorageService.setPokemonCache(json.data.pokemon);
            }
            return json.data.pokemon.map((poke: any) => new Pokemon(poke));
        } catch (error) {
            console.error("Error fetching Pokemon list:", error);
            throw error;
        }
    }

    static async fetchPokemonByIds(ids: number[]): Promise<Pokemon[]> {
        if (ids.length === 0) return [];
        try {
            const response = await fetch(process.env.EXPO_PUBLIC_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: this.getQueryWithIds(ids) }),
            });
            const json = await response.json();
            return json.data.pokemon.map((poke: any) => new Pokemon(poke));
        } catch (error) {
            console.error(`Error fetching Pokemon with ids ${ids}:`, error);
            throw error;
        }
    }

    static async fetchPokemonById(id: number) {
        try {
            const response = await fetch(process.env.EXPO_PUBLIC_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: this.getQueryWithId(id) }),
            });
            console.log(`query: ${this.getQueryWithId(id)}`);
            const json = await response.json();
            console.log(`Fetched Pokemon with id ${id}:`, json);
            return new Pokemon(json.data.pokemon[0]);
        } catch (error) {
            console.error(`Error fetching Pokemon with id ${id}:`, error);
            throw error;
        }
    }

    static async clearCache() {
        await StorageService.clearPokemonCache();
    }

    static getQueryWithIds(ids: number[]) {
        const idList = ids.join(", ");
        return `
            query GetPokemon {
                pokemon(where: {id: {_in: [${idList}]}}) {
                    weight
                    height
                    id
                    name
                    order
                pokemonforms {
                    id
                    name
                    form_name
                    is_mega
                }
                pokemonspecy {
                    pokemoncolor {
                        name
                    }
                    is_baby
                    is_legendary
                    is_mythical
                }
                pokemonsprites {
                    sprites
                }
                pokemontypes {
                    type {
                        name
                    }
                }
            }
        }
        `
    }

    static getQueryWithId(id: number) {
        return `
            query GetPokemon {
                pokemon(where: {id: {_eq: ${id}}}) {
                    weight
                    height
                    id
                    name
                    order
                pokemonforms {
                    id
                    name
                    form_name
                    is_mega
                }
                pokemonspecy {
                    pokemoncolor {
                        name
                    }
                    is_baby
                    is_legendary
                    is_mythical
                }
                pokemonsprites {
                    sprites
                }
                pokemontypes {
                    type {
                        name
                    }
                }
            }
        }
        `
    }

    static getQueryWithPagination(limit: number, offset: number) {
        return `
            query GetPokemon {
                pokemon(limit: ${limit}, offset: ${offset}, order_by: {id: asc}, where: {pokemonspecy: {_or: [{is_legendary: {_eq: true}}, {is_mythical: {_eq: true}}, {is_baby: {_eq: true}}]}}) {
                    weight
                    height
                    id
                    name
                    order
                pokemonforms {
                    id
                    name
                    form_name
                    is_mega
                }
                pokemonspecy {
                    pokemoncolor {
                        name
                    }
                    is_baby
                    is_legendary
                    is_mythical
                }
                pokemonsprites {
                    sprites
                }
                pokemontypes {
                    type {
                        name
                    }
                }
            }
        }
        `
    }   
}