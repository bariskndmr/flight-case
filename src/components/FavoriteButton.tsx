import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { FlightDto } from '../api/flight.types';
import { useFavorites } from '../features/favorites/favoritesStore';
import { colors } from './theme';

type Props = { flight: FlightDto };

/**
 * Reads favorite state from the store by id, never from the flight object,
 * so the list, detail and favorites screens always agree.
 */
export function FavoriteButton({ flight }: Props) {
  const isFavorite = useFavorites(state => flight.id in state.favorites);
  const hasHydrated = useFavorites(state => state.hasHydrated);
  const toggleFavorite = useFavorites(state => state.toggleFavorite);

  const label = isFavorite
    ? `${flight.flightNumber} favorilerden çıkar`
    : `${flight.flightNumber} favorilere ekle`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFavorite, disabled: !hasHydrated }}
      // Disabled until saved favorites are loaded; the store action checks this too.
      disabled={!hasHydrated}
      onPress={() => toggleFavorite(flight)}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, !hasHydrated && styles.disabled]}
    >
      <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.accent} />
      {/* Visible text states it too, so the state is not carried by the icon/color alone. */}
      <Text style={styles.text}>{isFavorite ? 'Favoride' : 'Favori'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8 },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
  text: { fontSize: 15, color: colors.accent, fontWeight: '600' },
});
