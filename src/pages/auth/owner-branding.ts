import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { http } from '../../lib/http'
import type { PublicOwnerResponse } from '../../lib/types'

async function fetchPublicOwner(ownerSlug: string) {
  const { data } = await http.get<PublicOwnerResponse>('/auth/public-owner', {
    params: { owner: ownerSlug },
  })
  return data
}

function buildOwnerQuery(ownerSlug: string | null) {
  return ownerSlug ? `?owner=${encodeURIComponent(ownerSlug)}` : ''
}

export function useOwnerBranding() {
  const [searchParams] = useSearchParams()
  const ownerSlug = searchParams.get('owner')

  const ownerQuery = useQuery({
    queryKey: ['public-owner', ownerSlug],
    queryFn: () => fetchPublicOwner(ownerSlug as string),
    enabled: Boolean(ownerSlug),
    retry: false,
  })

  const ownerBranding = ownerQuery.data?.item ?? null
  const ownerQueryString = useMemo(() => buildOwnerQuery(ownerSlug), [ownerSlug])

  return {
    ownerSlug,
    ownerBranding,
    ownerQuery,
    ownerQueryString,
  }
}

export function withOwnerQuery(path: string, ownerSlug: string | null) {
  return `${path}${buildOwnerQuery(ownerSlug)}`
}
