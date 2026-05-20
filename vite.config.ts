import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const phpBaseUrl =
    env.VITE_PHP_BASE_URL ?? 'http://localhost/Rental-house-management-system'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/admin': {
          target: phpBaseUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: phpBaseUrl,
          changeOrigin: true,
        },
        '/admin/uploads': {
          target: phpBaseUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
