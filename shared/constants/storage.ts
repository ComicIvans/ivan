/**
 * What the site stores in the visitor's browser. nuxt.config passes these
 * names to the modules that use them, and the legal page lists them, so the
 * storage table always shows the names in use.
 */

/**
 * The language chosen with the language switcher, kept for 365 days. Only
 * the switcher writes it; @nuxtjs/i18n only reads it to open / in that
 * language.
 */
export const localeCookieName = 'i18n_redirected'

/** Attributes of the language cookie, as the switcher writes it. */
export const localeCookieOptions = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
} as const

/**
 * @nuxtjs/color-mode: the theme preference in localStorage, without expiry.
 * The module writes it on every page load: "system" (follow the device) until
 * the visitor picks light or dark with the theme button.
 */
export const colorModeStorageKey = 'nuxt-color-mode'
