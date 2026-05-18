export function getApiErrorMessage(error: unknown, fallback: string) {
  const maybeAxios = error as { response?: { data?: { message?: string } } }
  return maybeAxios.response?.data?.message ?? fallback
}
