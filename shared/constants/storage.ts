/**
 * What the site stores in the visitor's browser. nuxt.config passes these
 * names to the modules that write them, and the legal page lists them, so the
 * storage table always shows the names in use.
 */

/** @nuxtjs/i18n: remembers the chosen language for 365 days. */
export const localeCookieName = 'i18n_redirected'

/** @nuxtjs/color-mode: remembers the chosen theme in localStorage, without expiry. */
export const colorModeStorageKey = 'nuxt-color-mode'
