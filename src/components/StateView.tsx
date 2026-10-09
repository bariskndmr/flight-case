import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

type Props =
  | { kind: 'loading' }
  | { kind: 'message'; message: string; actionLabel?: string; onAction?: () => void };

/** Full-area loading / error / empty view. A screen renders exactly one of these or its content. */
export function StateView(props: Props) {
  if (props.kind === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} accessibilityLabel="Yükleniyor" />
      </View>
    );
  }

  const { message, actionLabel, onAction } = props;
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  message: { fontSize: 16, color: colors.text, textAlign: 'center' },
  action: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.accent },
  actionText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
});
