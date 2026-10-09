import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { FlightSort } from '../../api/flight.types';
import type { FlightFilters } from '../../api/flights';
import { colors } from '../../components/theme';

const SORT_OPTIONS: { value: FlightSort; label: string }[] = [
  { value: 'price', label: 'En düşük fiyat' },
  { value: 'duration', label: 'En kısa süre' },
];

type Props = {
  filters: FlightFilters;
  /** Shown only once the first page has answered; `null` while loading or after an error. */
  total: number | null;
  onChange: (filters: FlightFilters) => void;
};

/** Filter, sort and result count. Rendered above the FlatList so it stays in place while the list scrolls. */
export function FlightListControls({ filters, total, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Yalnızca direkt</Text>
        <Switch
          accessibilityLabel="Yalnızca direkt uçuşlar"
          value={filters.onlyDirect}
          onValueChange={onlyDirect => onChange({ ...filters, onlyDirect })}
          trackColor={{ true: colors.accent }}
        />
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(option => {
          const selected = filters.sort === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              // Plain label: the selection is announced via accessibilityState, not by reading out "✓".
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => {
                if (!selected) onChange({ ...filters, sort: option.value });
              }}
              style={[styles.sortOption, selected && styles.sortOptionSelected]}
            >
              {/* The check mark makes the selection visible without relying on color. */}
              <Text style={[styles.sortText, selected && styles.sortTextSelected]}>
                {selected ? `✓ ${option.label}` : option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.total}>{total === null ? ' ' : `${total} uçuş`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: colors.text },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOptionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  sortText: { fontSize: 15, color: colors.text },
  sortTextSelected: { color: colors.accent, fontWeight: '600' },
  total: { fontSize: 14, color: colors.textMuted },
});
