import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FlightDto } from '../api/flight.types';
import { toFlightView } from '../domain/flightView';
import { FavoriteButton } from './FavoriteButton';
import { colors, fontSize, opacity, spacing, surface } from './theme';

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
          <Text style={styles.airline}>{view.title}</Text>
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
      {/*
        Sibling of the card's Pressable, not a child: a tap here never bubbles into the detail navigation,
        and VoiceOver sees two elements (an accessible parent would merge its children into one).
      */}
      <View style={styles.actions}>
        <FavoriteButton flight={flight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  body: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  pressed: { opacity: opacity.pressed },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  airline: { fontSize: fontSize.caption, color: colors.textMuted, flexShrink: 1 },
  price: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  time: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  code: { fontSize: fontSize.caption, color: colors.textMuted },
  middle: { alignItems: 'center' },
  meta: { fontSize: fontSize.caption, color: colors.textMuted },
  arrival: { alignItems: 'flex-end' },
  nextDay: { fontSize: fontSize.caption, fontWeight: '600', color: colors.accent },
});
