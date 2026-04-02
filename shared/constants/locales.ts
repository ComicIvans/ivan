export const defaultLocale = 'es' as const

export const siteLocales = [
  {
    code: 'es',
    language: 'es-ES',
    name: 'Español',
    file: 'es.json',
    icon: 'circle-flags:es',
    ogLocale: 'es_ES',
  },
  {
    code: 'en',
    language: 'en-GB',
    name: 'English',
    file: 'en.json',
    icon: 'circle-flags:gb',
    ogLocale: 'en_GB',
  },
  {
    code: 'de',
    language: 'de-DE',
    name: 'Deutsch',
    file: 'de.json',
    icon: 'circle-flags:de',
    ogLocale: 'de_DE',
  },
] as const

export type SiteLocaleCode = (typeof siteLocales)[number]['code']
