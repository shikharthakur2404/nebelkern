import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Allow importing .glsl and .vert/.frag files as raw strings
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
})
