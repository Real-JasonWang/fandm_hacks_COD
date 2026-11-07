import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// hackathon fast setup yolo
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
