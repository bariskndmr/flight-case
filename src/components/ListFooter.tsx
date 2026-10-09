import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { colors, fontSize, spacing } from './theme';

type Props = {
  loadingMore: boolean;
  loadMoreError: boolean;
  onRetry: () => void;
};

/** Sits under the last card, so the list stays visible and scrollable while the next page loads or fails. */
export function ListFooter({ loadingMore, loadMoreError, onRetry }: Props) {
  if (loadingMore) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} accessibilityLabel="Sonraki sayfa yükleniyor" />
      </View>
    );
  }

  if (loadMoreError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Sonraki sayfa yüklenemedi.</Text>
        <ActionButton label="Tekrar dene" onPress={onRetry} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm },
  error: { color: colors.error, fontSize: fontSize.body },
});
