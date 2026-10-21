/**
 * Brand hex values for contexts that cannot read CSS custom properties
 * (the <meta theme-color> tag, WebGL shader uniforms, the Satori-rendered
 * OG image). Keep these in sync
 * with the `ember`/amber/blue tokens declared in app/assets/css/main.css's
 * `@theme` block — they are the same ramp, just duplicated for JS-only use.
 */
export const themeColors = {
  /** --color-ember-400 */
  emberLight: '#f47c74',
  /** --color-ember-500 */
  ember: '#e85d55',
  /** Tailwind amber-400, used as the secondary accent */
  amber: '#fbbf24',
  /** Tailwind blue-500, the dark-mode ambient accent */
  blue: '#3b82f6',
} as const

/** Browser chrome / PWA theme-color meta value (light and dark share one tone). */
export const themeColorMeta = themeColors.emberLight

/** Aurora hero backdrop color stops per color scheme. */
export const auroraColorStops = {
  light: [themeColors.ember, themeColors.amber, themeColors.emberLight],
  dark: [themeColors.ember, themeColors.blue, themeColors.emberLight],
} as const
