import { Pokemon } from "./models/Pokemon";

export default class Utils {
    static kebabToTitleCase(str: string) {
        return str
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // TODO: make it return 2 colors - background and text color - white on yellow is not visible, black on brown the same
    static typeToColor(type: string): string {
        const TYPE_COLORS: Record<string, string> = {
            normal: "#A8A77A",
            fire: "#EE8130",
            water: "#6390F0",
            electric: "#F7D02C",
            grass: "#7AC74C",
            ice: "#96D9D6",
            fighting: "#C22E28",
            poison: "#A33EA1",
            ground: "#E2BF65",
            flying: "#A98FF3",
            psychic: "#F95587",
            bug: "#A6B91A",
            rock: "#B6A136",
            ghost: "#735797",
            dragon: "#6F35FC",
            dark: "#705746",
            steel: "#B7B7CE",
            fairy: "#D685AD",
        };
    return TYPE_COLORS[type] ?? "#888";
  }
}