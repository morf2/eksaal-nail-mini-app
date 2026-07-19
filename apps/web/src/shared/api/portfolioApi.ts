import type { PortfolioItem } from '@eksaal/shared'
import { API_BASE_URL, parseResponse } from './apiClient'

// Thin client for apps/api's /portfolio endpoints — mirrors bookingsApi.ts. GET is
// public; POST/PATCH/DELETE require the admin session cookie (credentials: 'include').
export async function fetchPortfolioFromApi(): Promise<PortfolioItem[]> {
  const response = await fetch(`${API_BASE_URL}/portfolio`, { credentials: 'include' })
  return parseResponse<PortfolioItem[]>(response)
}

export interface CreatePortfolioItemPayload {
  imageBase64: string
  title: string
  category: PortfolioItem['category']
  description?: string
}

export async function createPortfolioItemApi(input: CreatePortfolioItemPayload): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<PortfolioItem>(response)
}

export interface UpdatePortfolioItemPayload {
  imageBase64?: string
  title?: string
  category?: PortfolioItem['category']
  description?: string
  isHidden?: boolean
}

export async function updatePortfolioItemApi(
  id: string,
  patch: UpdatePortfolioItemPayload,
): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return parseResponse<PortfolioItem>(response)
}

export async function deletePortfolioItemApi(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  await parseResponse<null>(response)
}
