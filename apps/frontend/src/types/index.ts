export interface Order {
  id: string
  customerName: string
  drink: string
  size: string
  quantity: number
  total: number
  status: string
  createdAt: string
}

export interface BaristaNotification {
  id: string
  orderId: string
  message: string
  receivedAt: string
}

export interface MenuItem {
  id: string
  name: string
  emoji: string
  description: string
  price: number
  sizePrice: Record<string, number>
}

export interface CartLine {
  key: string
  drink: string
  size: string
  quantity: number
  unitPrice: number
}

export const SIZES = ['Small', 'Medium', 'Large'] as const
export type Size = (typeof SIZES)[number]