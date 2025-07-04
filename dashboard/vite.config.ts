import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for production build
  server: {
    host: true,
    port: 3000,
    hmr: {
      port: 3001
    }
  },
  preview: {
    port: 3000
  }
})