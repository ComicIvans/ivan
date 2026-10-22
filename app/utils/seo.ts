/**
 * Document title of a page: "<page> | <site name>", or the site name alone.
 * app.vue uses it as the title template and usePageSeo for og:title, so the
 * tab, search results and link previews read the same.
 */
export function withSiteName(title: string | undefined, siteName: string) {
  return title ? `${title} | ${siteName}` : siteName
}
