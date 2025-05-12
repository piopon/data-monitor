import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/scraper': {
        target: 'http://192.168.0.103:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/scraper/, '')
      }
    }
  }
})
