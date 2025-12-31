// Centralized locale configuration
export interface LocaleConfig {
  code: string
  name: string
  icon: string
  ogLocale: string
}

export const localesConfig = [
  { code: 'es', name: 'Español', icon: 'circle-flags:es', ogLocale: 'es_ES' },
  { code: 'en', name: 'English', icon: 'circle-flags:gb', ogLocale: 'en_GB' },
  { code: 'de', name: 'Deutsch', icon: 'circle-flags:de', ogLocale: 'de_DE' },
] as const satisfies readonly LocaleConfig[]

export type LocaleCode = (typeof localesConfig)[number]['code']

export const getLocaleConfig = (code: string): LocaleConfig => {
  return localesConfig.find((l) => l.code === code) ?? localesConfig[0]!
}

export const getOgLocale = (code: string): string => {
  return getLocaleConfig(code).ogLocale
}

// Lazy loading de chistes por idioma
export const loadJokes = async (locale: string): Promise<string[]> => {
  try {
    switch (locale) {
      case 'es':
        return (await import('~/assets/jokes-es.json')).default
      case 'de':
        return (await import('~/assets/jokes-de.json')).default
      case 'en':
      default:
        return (await import('~/assets/jokes-en.json')).default
    }
  } catch {
    return []
  }
}
