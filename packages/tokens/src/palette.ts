/**
 * Raw ORÉVA palette (design direction approved on 24 Nov 2026).
 *
 * Warm paper and plum ink, with lavender as a light. Taken from the founders'
 * moodboard (#4B365D, #A78BC6, #E7DDF4, #F7F3EE, #E9E1D7) and completed with the
 * tones an interface needs, every one checked for WCAG 2.2 AA in `colors.ts`.
 * Mint and orchid are gone. See docs/design/visual-reference.md.
 * Components use the semantic tokens in `colors.ts`, never these values directly.
 */
export const palette = {
  cream: {
    50: '#FFFDFA', // paper: surfaces, sheets
    100: '#F7F3EE', // cream: app background (moodboard)
    200: '#E9E1D7', // sand: sunken areas, placeholders (moodboard)
    300: '#E2D8CC', // hairline: decorative dividers only
    500: '#938779', // control boundary (>= 3:1 on cream and paper)
  },
  lavender: {
    100: '#E7DDF4', // lilac: selected chips, soft highlights (moodboard)
    200: '#DCCDEB', // mist: a third soft tint for covers
    400: '#A78BC6', // lavender: accent fills, ink text only (moodboard)
    600: '#6E5390', // iris: progress, links, active marks (passes on cream)
  },
  plum: {
    700: '#4B365D', // plum: primary actions, serif titles (moodboard)
    900: '#2A2230', // ink: text and icons
  },
  stone: {
    500: '#6B6170', // secondary text
    600: '#5A5060', // secondary text on tinted surfaces
  },
  sage: {
    100: '#E3EAE1', // success surface
    600: '#4E6853', // success text (darkened from #55705A to pass on its surface)
  },
  red: {
    700: '#A3352B', // errors only
  },
} as const;
