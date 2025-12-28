/**
 * Extract static value from i18n AST structure
 * @param val - Value that may contain i18n AST structure
 * @returns The extracted static string value or empty string
 */
export function getI18nStaticValue(val: any): string {
  if (typeof val === 'string') return val
  if (val?.body?.static) return val.body.static
  return ''
}
