import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'HealthtechWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})