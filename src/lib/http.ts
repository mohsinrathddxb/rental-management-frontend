import axios from 'axios'

const defaultApiBaseURL = '/api/admin'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseURL

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export const assetBaseURL =
  import.meta.env.VITE_ASSET_BASE_URL ??
  (isAbsoluteUrl(apiBaseURL)
    ? trimTrailingSlash(apiBaseURL).replace(/\/api\/admin$/i, '')
    : trimTrailingSlash(import.meta.env.VITE_PHP_BASE_URL ?? ''))

export const http = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})
