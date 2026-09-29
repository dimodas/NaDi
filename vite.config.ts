import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GANTI 'niaga-digital' di bawah ini kalau nama repo GitHub Anda berbeda.
  base: '/NaDi/',
})
