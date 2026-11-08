/**
 * Raw ORÉVA palette.
 *
 * Sampled from the founders' visual reference and the cahier des charges
 * (section 10), then adjusted for WCAG 2.2 AA. See docs/design/visual-reference.md.
 * Components should use the semantic tokens in `colors.ts`, not these values directly.
 */
export const palette = {
  lavender: {
    50: '#F4F1FE',
    100: '#ECE9FC', // pale wash framing the reference screens
    200: '#DCD3FD',
    300: '#C1B2FF', // violet tile in the reference
    400: '#A88AF0', // "Lavender primary" from the cahier des charges
    500: '#9B86FA', // primary accent in the reference (active tab, play/pause)
    600: '#7A5FE0', // white text passes AA (4.62)
    700: '#6B4FCF', // deep lavender for text accents and links (5.26 on background)
    800: '#4A3F8C',
    900: '#2E2659',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F5F4F7', // app background (reference #F5F5F5 with a hint of lavender)
    100: '#EFEEF2', // chips, muted surfaces
    200: '#E4E2E8', // decorative hairlines
    400: '#8C8695', // control boundaries (>= 3:1 on background and surface)
    600: '#6F6977', // secondary text (>= 4.5:1 on background, surface, muted)
    700: '#4D4756', // secondary text on pastel tiles
    900: '#26232D', // ink: primary text, icons and text on lavender
  },
  mint: {
    200: '#D9F0DC', // "Soft green" from the cahier des charges
    300: '#BAEABE', // mint tile in the reference
    700: '#256B34',
  },
  orchid: {
    200: '#EED9F8', // "Soft pink" from the cahier des charges
    300: '#F0C7FF', // pink tile in the reference
  },
  sky: {
    200: '#DCE7F7', // weather and class-update states
    700: '#3B5A85',
  },
  red: {
    700: '#B3261E', // errors only
  },
} as const;
