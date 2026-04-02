import { defaultLocale, siteLocales, type SiteLocaleCode } from '~~/shared/constants/locales'

export interface LocaleConfig {
  code: string
  language: string
  name: string
  file: string
  icon: string
  ogLocale: string
}

export const localesConfig = siteLocales satisfies readonly LocaleConfig[]

export type LocaleCode = SiteLocaleCode

export const getLocaleConfig = (code: string): LocaleConfig => {
  return localesConfig.find((l) => l.code === code) ?? localesConfig[0]!
}

export const getOgLocale = (code: string): string => {
  return getLocaleConfig(code).ogLocale
}

export const loadJokes = async (locale: string): Promise<string[]> => {
  try {
    switch (locale) {
      case 'de':
        return (await import('~/assets/jokes-de.json')).default
      case 'en':
        return (await import('~/assets/jokes-en.json')).default
      case defaultLocale:
      default:
        return (await import('~/assets/jokes-es.json')).default
    }
  } catch {
    return []
  }
}
