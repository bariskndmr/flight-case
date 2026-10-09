import { StyleSheet } from 'react-native';

/** The whole palette: one accent color, neutrals for text, borders and backgrounds. */
export const colors = {
  accent: '#0A64D6',
  accentSoft: '#E8F0FB',
  text: '#1B1F24',
  textMuted: '#5B6470',
  border: '#DDE1E6',
  background: '#F3F5F7',
  surface: '#FFFFFF',
  error: '#B3261E',
};

/** Every font size in the app comes from this scale. */
export const fontSize = {
  caption: 13,
  body: 15,
  title: 18,
  heading: 20,
  display: 24,
};

/** Every padding, margin and gap comes from this 4-pt scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/** Touch feedback: pressed controls dim, disabled ones dim further. */
export const opacity = {
  pressed: 0.6,
  disabled: 0.4,
};

export const radius = {
  control: 8,
  card: 12,
};

/** White rounded box with a hairline border: list cards and detail sections share it. */
export const surface = {
  backgroundColor: colors.surface,
  borderRadius: radius.card,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
};
