// Spanish (defaultLocale in shared/constants/locales.ts) is the source of
// truth: a message missing from en/de renders its Spanish text instead of the
// raw key. scripts/verify-i18n.mjs keeps the locale files in parity, so this
// is a safety net rather than a workflow. The code is a literal on purpose:
// the server build rewrites a relative import from this file to a wrong path.
export default defineI18nConfig(() => ({
  fallbackLocale: 'es',
}))
