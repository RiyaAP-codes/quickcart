import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this project from /quickcart/, so the published build
// needs that base path. Local dev and any root-hosted deploy keep '/' so
// http://localhost:5173/ still works unchanged.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/quickcart/' : '/',
  plugins: [react()],
})
