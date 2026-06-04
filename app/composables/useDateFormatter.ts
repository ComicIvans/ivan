/**
 * Locale-aware date formatting with cached Intl.DateTimeFormat instances
 * (one per locale + options combination). Replaces the per-render formatter
 * creation that the gallery pages previously duplicated.
 */
export function useDateFormatter() {
  const { locale } = useI18n({ useScope: 'global' })
  const cache = new Map<string, Intl.DateTimeFormat>()

  const getFormatter = (options: Intl.DateTimeFormatOptions) => {
    const key = `${locale.value}:${JSON.stringify(options)}`
    let formatter = cache.get(key)

    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale.value, options)
      cache.set(key, formatter)
    }

    return formatter
  }

  const formatDate = (
    dateStr: string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  ) => getFormatter(options).format(new Date(dateStr))

  return { formatDate }
}
