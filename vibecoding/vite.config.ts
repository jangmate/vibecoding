import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/vibecoding/',  // 레포 이름
  plugins: [react()],
})
