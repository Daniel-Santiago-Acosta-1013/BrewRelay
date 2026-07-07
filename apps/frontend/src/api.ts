import type { Order, BaristaNotification } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export function createOrder(input: {
  customerName: string
  drink: string
  size: string
  quantity: number
}): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getOrders(): Promise<Order[]> {
  return request<Order[]>('/orders')
}

export function getBaristaNotifications(): Promise<BaristaNotification[]> {
  return request<BaristaNotification[]>('/barista-notifications')
}

export function getHealth(): Promise<unknown> {
  return request<unknown>('/health')
}
