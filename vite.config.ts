import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['@mui/material', '@mui/icons-material'],
    },
    define: {
      'import.meta.env.ACCESS_PASSWORD': JSON.stringify(env.ACCESS_PASSWORD)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
