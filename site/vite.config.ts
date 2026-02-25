import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/kinbot/',
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
  },
})
