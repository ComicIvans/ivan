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
    // The default hover/active state fades primary to 75%, which drops the
    // button text below 4.5:1 (3.96:1 light, 4.29:1 dark); 90% keeps it
    // above 5.3:1 in both modes.
    button: {
      compoundVariants: [
        { color: 'primary', variant: 'solid', class: 'hover:bg-primary/90 active:bg-primary/90' },
        {
          color: 'primary',
          variant: 'link',
          class: 'hover:text-primary/90 active:text-primary/90',
        },
      ],
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
