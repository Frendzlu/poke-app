import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Pokemon } from "../models/Pokemon";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = "pokemon_list_cache";
// TODO: cache favorite pokemon

export default class FetchService {

    static async fetchPokemonList(offset: number = 0) {
        try {
            if (offset === 0) {
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    console.log("Using cached Pokemon list");
                    return JSON.parse(cachedData).map((poke: any) => new Pokemon(poke));
                }
            }
            const response = await fetch("https://graphql.pokeapi.co/v1beta2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: this.getQueryWithPagination(40, offset) }),
            });
            const json = await response.json();
            if (offset === 0) {
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(json.data.pokemon));
            }
            return json.data.pokemon.map((poke: any) => new Pokemon(poke));
        } catch (error) {
            console.error("Error fetching Pokemon list:", error);
            throw error;
        }
    }

    static async clearCache() {
        await AsyncStorage.removeItem(CACHE_KEY);
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