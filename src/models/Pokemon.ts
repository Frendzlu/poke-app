import Utils from "../Utils"

export interface PokemonListItem {
    id: number
    name: string
    bg_color: string
    text_color: string
    image_url: string
    types?: string[]
}

export class Pokemon {
    id: number
    name: string
    height: number
    weight: number
    pokemonforms: { 
        id: number; 
        name: string; 
        form_name: string; 
        is_mega: boolean 
    }[]
    pokemonSpecies: {
        pokemoncolor: string;
        is_baby: boolean;
        is_legendary: boolean; 
        is_mythical: boolean
    }
    sprite: string
    types: string[]

    constructor(obj: any) {
        // console.log("Creating Pokemon from JSON:", obj);
        this.id = obj.id
        this.name = Utils.kebabToTitleCase(obj.name)
        this.height = obj.height
        this.weight = obj.weight
        this.pokemonforms = obj.pokemonforms.map((form: any) => ({
            id: form.id,
            name: form.name,
            form_name: form.form_name,
            is_mega: form.is_mega
        }))
        this.pokemonSpecies = {
            pokemoncolor: obj.pokemonspecy.pokemoncolor.name,
            is_baby: obj.pokemonspecy.pokemoncolor.name.is_baby,
            is_legendary: obj.pokemonspecy.pokemoncolor.name.is_legendary,
            is_mythical: obj.pokemonspecy.pokemoncolor.name.is_mythical
        }
        this.sprite = obj.pokemonsprites[0].sprites.other["official-artwork"].front_default
        this.types = obj.pokemontypes.map((type: any) => type.type.name)
    }

    toListProps(): PokemonListItem {
        return {
            id: this.id,
            name: this.name,
            bg_color: this.pokemonSpecies.pokemoncolor, // TODO: see below
            text_color: "black", // TODO: determine text color based on pokemon color and mythical/legendary status
            image_url: this.sprite,
            types: this.types
        }
    }
}   
