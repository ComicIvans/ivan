import { es, en, de } from '@nuxt/ui/locale'

const localeMap = {
  es,
  en,
  de,
} as const

export function getNuxtUiLocale(locale: string) {
  return localeMap[locale as keyof typeof localeMap] || es
}
