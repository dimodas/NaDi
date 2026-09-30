import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Domain custom (nadi.digital) disajikan dari root, bukan sub-folder,
  // jadi base path dikembalikan ke '/'.
  base: '/',
})
