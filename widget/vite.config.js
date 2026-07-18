import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'HealthtechWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
})