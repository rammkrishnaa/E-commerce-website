import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/E-commerce-website/',
  plugins: [react()],
})