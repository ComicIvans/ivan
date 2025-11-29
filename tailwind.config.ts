import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

export default {
  content: [
    "./app/components/**/*.{vue,js,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/composables/**/*.{js,ts}",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#b91c1c",
          secondary: "#f87171",
          accent: "#fca5a5",
          neutral: "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#e5e7eb",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      {
        dark: {
          primary: "#ef4444",
          secondary: "#f87171",
          accent: "#fca5a5",
          neutral: "#1f2937",
          "base-100": "#1f2937",
          "base-200": "#111827",
          "base-300": "#374151",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
    darkTheme: "dark",
    logs: false,
  },
} satisfies Config;
