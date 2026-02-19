import { View, Image, StyleSheet } from "react-native";
import { Text, Surface, Chip } from "react-native-paper";
import { useFavoriteContext } from "../contexts/FavoritePokemonContext";
import { Pokemon } from "../models/Pokemon";
import Utils from "../Utils";
import Color from "color";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text variant="bodyMedium" style={styles.statLabel}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

function PokemonDetails({ pokemon }: { pokemon: Pokemon }) {
  const { favoritePokemonId, toggleFavorite } = useFavoriteContext();
  const isFavorite = pokemon.id === favoritePokemonId;

  const baseColor = Color(pokemon.pokemonSpecies.color);
  const bgColor = baseColor.lighten(0.6).hex();
  const accentColor = baseColor.darken(0.3).hex();

  const specialTags = [
    pokemon.pokemonSpecies.is_baby && {
      label: "Baby",
      icon: "baby-face-outline" as const,
    },
    pokemon.pokemonSpecies.is_legendary && {
      label: "Legendary",
      icon: "star" as const,
    },
    pokemon.pokemonSpecies.is_mythical && {
      label: "Mythical",
      icon: "auto-fix" as const,
    },
  ].filter(Boolean) as { label: string; icon: string }[];

  return (
    <View style={[styles.content]}>
      <Surface style={styles.imageSurface} elevation={2}>
        <Image
          source={{ uri: pokemon.sprite }}
          style={styles.image}
          resizeMode="contain"
        />
      </Surface>

      <Text
        variant="displaySmall"
        style={[styles.name, { color: accentColor }]}
      >
        {pokemon.name}
      </Text>

      <View style={styles.chipRow}>
        {pokemon.types.map((type) => (
          <Chip
            key={type}
            style={[styles.chip, { backgroundColor: Utils.typeToColor(type) }]}
            textStyle={styles.chipText}
          >
            {Utils.kebabToTitleCase(type)}
          </Chip>
        ))}
        {specialTags.map(({ label, icon }) => (
          <Chip
            key={label}
            icon={icon}
            style={styles.specialChip}
            textStyle={styles.specialChipText}
          >
            {label}
          </Chip>
        ))}
      </View>

      {/* Info card */}
      <Surface style={styles.statsCard} elevation={1}>
        <Text variant="titleMedium" style={styles.statsTitle}>
          Info
        </Text>
        <StatRow
          label="Pokédex #"
          value={`#${String(pokemon.id).padStart(3, "0")}`}
        />
        <StatRow
          label="Height"
          value={`${(pokemon.height / 10).toFixed(1)} m`}
        />
        <StatRow
          label="Weight"
          value={`${(pokemon.weight / 10).toFixed(1)} kg`}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: "transparent",
  },
  imageSurface: {
    borderRadius: 24,
    overflow: "hidden",
    width: "90%",
    height: "90%",
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontWeight: "bold",
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chip: {
    borderRadius: 20,
  },
  chipText: {
    color: "#fff",
    fontWeight: "600",
  },
  specialChip: {
    borderRadius: 20,
    backgroundColor: "#FFD700",
  },
  specialChipText: {
    color: "#5a4000",
    fontWeight: "700",
  },
  statsCard: {
    width: "90%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  statsTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  statLabel: {
    color: "#666",
  },
  statValue: {
    fontWeight: "600",
  },
});

export default PokemonDetails;
