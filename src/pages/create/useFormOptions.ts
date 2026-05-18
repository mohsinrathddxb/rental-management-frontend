import { useQuery } from '@tanstack/react-query'
import { http } from '../../lib/http'
import type { FormOptionsResponse } from '../../lib/types'

async function fetchFormOptions() {
  const { data } = await http.get<FormOptionsResponse>('/resources/form-options.php')
  return data
}

export function useFormOptions() {
  return useQuery({
    queryKey: ['form-options'],
    queryFn: fetchFormOptions,
    staleTime: 5 * 60 * 1000,
  })
}
