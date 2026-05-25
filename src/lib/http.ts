import axios from 'axios'

const defaultApiBaseURL = '/api/admin'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseURL

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function nonEmptyTrimmed(value: string | undefined) {
  const trimmed = trimTrailingSlash(String(value ?? '').trim())
  return trimmed || undefined
}

export const assetBaseURL =
  nonEmptyTrimmed(import.meta.env.VITE_ASSET_BASE_URL) ??
  nonEmptyTrimmed(import.meta.env.VITE_BACKEND_ORIGIN) ??
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

let authRedirectInFlight = false

function shouldHandleUnauthorized(url: string | undefined) {
  const normalizedUrl = String(url ?? '')
  return !normalizedUrl.includes('/auth/login') && !normalizedUrl.includes('/auth/session')
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const requestUrl = String(error?.config?.url ?? '')

    if (status === 401 && shouldHandleUnauthorized(requestUrl) && typeof window !== 'undefined' && !authRedirectInFlight) {
      authRedirectInFlight = true
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('reason', 'session-expired')
      window.location.replace(loginUrl.toString())
    }

    return Promise.reject(error)
  },
)
