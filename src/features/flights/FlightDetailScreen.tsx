import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../components/theme';
import { toFlightView } from '../../domain/flightView';
import type { FlightDetailScreenProps } from '../../navigation/types';

/**
 * Renders the FlightDto passed by the list or favorites screen; no extra request.
 * The data is static for the case, and the list already holds the full object.
 */
export function FlightDetailScreen({ route }: FlightDetailScreenProps) {
  const view = toFlightView(route.params.flight);
  // The native header covers the top inset; only the bottom (home indicator) needs padding.
  const { bottom } = useSafeAreaInsets();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: bottom + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {view.airline} · {view.flightNumber}
        </Text>
        <Text style={styles.price}>{view.price}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kalkış</Text>
        <Text style={styles.time}>
          {view.departureTime} · {view.originCode}
        </Text>
        <Text style={styles.detail}>{view.originName}</Text>
        <Text style={styles.detail}>{view.departureDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varış</Text>
        <Text style={styles.time}>
          {view.arrivalTime} · {view.destinationCode}
        </Text>
        <Text style={styles.detail}>{view.destinationName}</Text>
        <Text style={styles.detail}>
          {view.arrivalDate}
          {view.arrivesNextDay ? ' (ertesi gün)' : ''}
        </Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="Süre" value={view.duration} />
        <InfoRow label="Aktarma" value={view.stops} />
        <InfoRow label="Bagaj" value={view.baggage} />
      </View>

      {/* Favorite toggle is added in block 4, reading its state from the favorites store by id. */}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  header: { gap: 4 },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  price: { fontSize: 24, fontWeight: '700', color: colors.text },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  sectionTitle: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase' },
  time: { fontSize: 22, fontWeight: '600', color: colors.text },
  detail: { fontSize: 15, color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 15, color: colors.textMuted },
  infoValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
});
