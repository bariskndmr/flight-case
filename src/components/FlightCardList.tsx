import { useCallback } from 'react';
import { FlatList, StyleSheet, type FlatListProps, type ListRenderItem } from 'react-native';
import type { FlightDto } from '../api/flight.types';
import { FlightCard } from './FlightCard';
import { spacing } from './theme';

type Props = Omit<FlatListProps<FlightDto>, 'data' | 'renderItem' | 'keyExtractor'> & {
  flights: FlightDto[];
  onPressFlight: (flight: FlightDto) => void;
};

/** The card list shared by the flights and favorites screens; paging props pass straight through to FlatList. */
export function FlightCardList({ flights, onPressFlight, ...listProps }: Props) {
  const renderItem: ListRenderItem<FlightDto> = useCallback(
    ({ item }) => <FlightCard flight={item} onPress={onPressFlight} />,
    [onPressFlight],
  );

  return (
    <FlatList
      data={flights}
      // Stable server id, never the index: cards keep their identity when pages are appended.
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      {...listProps}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.sm },
});
