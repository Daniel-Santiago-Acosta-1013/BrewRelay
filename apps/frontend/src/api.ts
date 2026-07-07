import type { Order, BaristaNotification, MenuItem } from '@/types'

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

export function updateOrderStatus(id: string, status: string): Promise<Order> {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getOrders(): Promise<Order[]> {
  return request<Order[]>('/orders')
}

export function getBaristaNotifications(): Promise<BaristaNotification[]> {
  return request<BaristaNotification[]>('/barista-notifications')
}

export function getMenu(): Promise<MenuItem[]> {
  return request<MenuItem[]>('/menu')
}

export function getHealth(): Promise<unknown> {
  return request<unknown>('/health')
}