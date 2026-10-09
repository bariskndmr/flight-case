import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FlightDto } from '../api/flight.types';
import { toFlightView } from '../domain/flightView';
import { colors } from './theme';

type Props = {
  flight: FlightDto;
  onPress: (flight: FlightDto) => void;
};

export function FlightCard({ flight, onPress }: Props) {
  const view = toFlightView(flight);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={view.accessibilitySummary}
        accessibilityHint="Uçuş detayını açar"
        onPress={() => onPress(flight)}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <View style={styles.row}>
          <Text style={styles.airline}>
            {view.airline} · {view.flightNumber}
          </Text>
          <Text style={styles.price}>{view.price}</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.time}>{view.departureTime}</Text>
            <Text style={styles.code}>{view.originCode}</Text>
          </View>

          <View style={styles.middle}>
            <Text style={styles.meta}>{view.duration}</Text>
            <Text style={styles.meta}>{view.stops}</Text>
          </View>

          <View style={styles.arrival}>
            <Text style={styles.time}>
              {view.arrivalTime}
              {view.arrivesNextDay ? <Text style={styles.nextDay}> +1</Text> : null}
            </Text>
            <Text style={styles.code}>{view.destinationCode}</Text>
          </View>
        </View>
      </Pressable>
      {/* The favorite button is added in block 4 as a sibling of the Pressable, not inside it. */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  body: { padding: 16, gap: 12 },
  pressed: { opacity: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  airline: { fontSize: 14, color: colors.textMuted, flexShrink: 1 },
  price: { fontSize: 17, fontWeight: '700', color: colors.text },
  time: { fontSize: 20, fontWeight: '600', color: colors.text },
  code: { fontSize: 13, color: colors.textMuted },
  middle: { alignItems: 'center' },
  meta: { fontSize: 13, color: colors.textMuted },
  arrival: { alignItems: 'flex-end' },
  nextDay: { fontSize: 13, fontWeight: '600', color: colors.accent },
});
