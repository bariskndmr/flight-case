import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavoriteButton } from '../../components/FavoriteButton';
import { colors, fontSize, spacing, surface } from '../../components/theme';
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
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: bottom + spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{view.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{view.price}</Text>
          <FavoriteButton flight={route.params.flight} />
        </View>
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
  content: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.xs },
  title: { fontSize: fontSize.title, fontWeight: '600', color: colors.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: fontSize.display, fontWeight: '700', color: colors.text },
  section: { ...surface, padding: spacing.lg, gap: spacing.xs },
  sectionTitle: { fontSize: fontSize.caption, color: colors.textMuted, textTransform: 'uppercase' },
  time: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  detail: { fontSize: fontSize.body, color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  infoLabel: { fontSize: fontSize.body, color: colors.textMuted },
  infoValue: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
});
