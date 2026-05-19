import axios from 'axios'

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? '/api/admin'
    : 'http://localhost:4000/api/admin')

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export const assetBaseURL =
  import.meta.env.VITE_ASSET_BASE_URL ??
  trimTrailingSlash(apiBaseURL).replace(/\/api\/admin$/i, '')

export const http = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})
