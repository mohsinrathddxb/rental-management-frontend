import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? '/api/admin'
    : 'http://localhost/Rental-house-management-system/api/admin')

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})
