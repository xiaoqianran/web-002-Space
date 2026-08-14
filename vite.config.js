import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  esbuild: { target: "esnext" },
  optimizeDeps: {
    esbuildOptions: { target: "esnext" },
  },
})
