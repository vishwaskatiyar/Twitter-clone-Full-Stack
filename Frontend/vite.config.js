import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

    proxy: {
      '/api': {
        target: 'https://twitter-clone-full-stack-0ru5.onrender.com',
        changeOrigin: true,
      },
    }
  }
})
