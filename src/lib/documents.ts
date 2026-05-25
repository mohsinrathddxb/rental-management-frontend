import { http } from './http'

function buildObjectUrlFromBlob(blob: Blob) {
  return window.URL.createObjectURL(blob)
}

export async function openAuthenticatedPdf(path: string, query: Record<string, string | number>) {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    searchParams.set(key, String(value))
  })

  const response = await http.get(`${path}?${searchParams.toString()}`, {
    responseType: 'blob',
  })

  const blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: 'application/pdf' })

  const objectUrl = buildObjectUrlFromBlob(blob)
  const openedWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer')

  if (!openedWindow) {
    const fallbackLink = document.createElement('a')
    fallbackLink.href = objectUrl
    fallbackLink.target = '_blank'
    fallbackLink.rel = 'noopener noreferrer'
    fallbackLink.click()
  }

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl)
  }, 60_000)
}
