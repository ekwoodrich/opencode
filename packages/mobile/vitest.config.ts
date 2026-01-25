import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.{spec,test}.{ts,tsx}"],
    exclude: ["node_modules", ".expo", ".expo-shared", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "**/__tests__/**", "**/*.config.{js,ts}", "**/types/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "react-native": "react-native-web",
    },
    extensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js"],
  },
})
