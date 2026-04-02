/**
 * Extract static value from i18n AST structure
 * @param val - Value that may contain i18n AST structure
 * @returns The extracted static string value or empty string
 */
export function getI18nStaticValue(val: unknown): string {
  if (typeof val === 'string') return val
  if (
    typeof val === 'object' &&
    val !== null &&
    'body' in val &&
    typeof val.body === 'object' &&
    val.body !== null &&
    'static' in val.body &&
    typeof val.body.static === 'string'
  ) {
    return val.body.static
  }
  return ''
}
