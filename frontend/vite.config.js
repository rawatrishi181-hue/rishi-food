import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Don't fail if port 5173 is in use
  },
  optimizeDeps: {
    include: ['lucide-react'],
  }
})
