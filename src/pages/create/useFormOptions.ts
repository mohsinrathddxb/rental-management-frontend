import { useQuery } from '@tanstack/react-query'
import { http } from '../../lib/http'
import type { FormOptionsResponse } from '../../lib/types'

async function fetchFormOptions() {
  const { data } = await http.get<FormOptionsResponse>('/resources/form-options')
  return data
}

export function useFormOptions(options?: {
  staleTime?: number
  refetchOnMount?: boolean | 'always'
}) {
  return useQuery({
    queryKey: ['form-options'],
    queryFn: fetchFormOptions,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    refetchOnMount: options?.refetchOnMount,
  })
}
