import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Debe coincidir con `PORT` de la API (por defecto 3001). */
const chatProxy = {
  "/chat": {
    target: process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:3001",
    changeOrigin: true,
  },
} as const;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { ...chatProxy },
  },
  preview: {
    proxy: { ...chatProxy },
  },
});
