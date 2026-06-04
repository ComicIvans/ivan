import type { ComputedRef } from 'vue'
import { getI18nStaticValue } from '~/utils/i18nAst'

interface I18nListItemContext {
  /** The raw list item (string or AST object). */
  item: unknown
  /** The list item coerced to a record for keyed field access. */
  raw: Record<string, unknown>
  /** Extracts the static value of a field (used for ids / icon-map keys). */
  value: (field: unknown) => string
  /** Extracts and translates a field (static value piped through `rt`). */
  tr: (field: unknown) => string
  index: number
}

/**
 * Reads a list from the i18n messages and maps it to typed objects. Centralizes
 * the repeated `tm(key) as unknown` → `Array.isArray` → unsafe-cast → `.map`
 * boilerplate that every list page used to carry.
 */
export function useI18nList<T>(
  key: string,
  mapper: (context: I18nListItemContext) => T
): ComputedRef<T[]> {
  const { tm, rt } = useI18n({ useScope: 'global' })

  return computed(() => {
    const data = tm(key) as unknown
    const items = Array.isArray(data) ? data : []

    return items.map((item: unknown, index) =>
      mapper({
        item,
        raw: (item as Record<string, unknown>) || {},
        value: (field) => getI18nStaticValue(field),
        tr: (field) => rt(getI18nStaticValue(field)),
        index,
      })
    )
  })
}
