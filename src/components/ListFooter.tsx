import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

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
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  error: { color: colors.error, fontSize: 15 },
  retry: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.accent },
  retryText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
});
