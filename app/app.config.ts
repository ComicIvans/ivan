export default defineAppConfig({
  ui: {
    colors: {
      primary: 'ember',
      secondary: 'stone',
      success: 'green',
      info: 'blue',
      warning: 'amber',
      error: 'rose',
    },
    skeleton: {
      base: 'skeleton-brand rounded-md',
    },
    // Nuxt UI defaults to lucide, which is not installed: map the built-in
    // icons the app's components render (select, pagination, modal/toast
    // close, loading states) to tabler so every icon comes from the locally
    // bundled collection instead of the remote Iconify API.
    icons: {
      check: 'i-tabler-check',
      chevronDown: 'i-tabler-chevron-down',
      chevronLeft: 'i-tabler-chevron-left',
      chevronRight: 'i-tabler-chevron-right',
      chevronDoubleLeft: 'i-tabler-chevrons-left',
      chevronDoubleRight: 'i-tabler-chevrons-right',
      close: 'i-tabler-x',
      ellipsis: 'i-tabler-dots',
      loading: 'i-tabler-loader-2',
    },
  },
})
