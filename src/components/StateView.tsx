import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { colors, fontSize, spacing } from './theme';

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
      {actionLabel && onAction ? <ActionButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  message: { fontSize: fontSize.body, color: colors.text, textAlign: 'center' },
});
