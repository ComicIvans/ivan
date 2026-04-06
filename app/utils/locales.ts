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

const normalizePathname = (pathname: string): string => {
  if (!pathname) {
    return '/'
  }

  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (normalizedPathname !== '/' && normalizedPathname.endsWith('/')) {
    return normalizedPathname.slice(0, -1)
  }

  return normalizedPathname
}

const stripLocalePrefix = (pathname: string): string => {
  const normalizedPathname = normalizePathname(pathname)
  const segments = normalizedPathname.split('/')
  const localePrefix = segments[1]

  if (!localesConfig.some((locale) => locale.code === localePrefix)) {
    return normalizedPathname
  }

  return normalizePathname(`/${segments.slice(2).join('/')}`)
}

export const getLocaleSwitchPath = (currentPath: string, targetLocale: LocaleCode): string => {
  const [pathname = '/', suffix = ''] = currentPath.match(/^([^?#]*)(.*)$/)?.slice(1) ?? []
  const basePath = stripLocalePrefix(pathname)
  const localizedPath =
    targetLocale === defaultLocale
      ? basePath
      : `/${targetLocale}${basePath === '/' ? '' : basePath}`

  return `${localizedPath}${suffix}`
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
