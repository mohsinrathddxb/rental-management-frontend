import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin =
    env.VITE_BACKEND_ORIGIN ?? 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/admin': {
          target: backendOrigin,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
