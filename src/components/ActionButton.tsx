import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, opacity, radius, spacing } from './theme';

type Props = {
  label: string;
  onPress: () => void;
};

/** The one call-to-action button ("Tekrar dene", "Filtreyi temizle"), so every retry looks and reads the same. */
export function ActionButton({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.accent,
  },
  pressed: { opacity: opacity.pressed },
  label: { color: colors.surface, fontSize: fontSize.body, fontWeight: '600' },
});
