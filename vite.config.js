import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ssl': {
        target: 'https://api.ssllabs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ssl/, '/api/v3/analyze'),
        secure: false,
      }
    }
  }
})
