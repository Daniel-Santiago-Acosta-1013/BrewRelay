export interface Order {
  id: string
  customerName: string
  drink: string
  size: string
  quantity: number
  status: string
  createdAt: string
}

export interface BaristaNotification {
  id: string
  orderId: string
  message: string
  receivedAt: string
}

export const DRINKS = ['Latte', 'Americano', 'Cappuccino', 'Mocha', 'Espresso']
export const SIZES = ['Small', 'Medium', 'Large']
