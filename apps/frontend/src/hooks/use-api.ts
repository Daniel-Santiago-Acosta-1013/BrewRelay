import { useState, useEffect, useCallback } from 'react'
import type { Order, BaristaNotification } from '@/types'
import {
  createOrder,
  getOrders,
  getBaristaNotifications,
  getHealth,
} from '@/api'

export function useHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(null)

  const check = useCallback(async () => {
    try {
      await getHealth()
      setHealthy(true)
    } catch {
      setHealthy(false)
    }
  }, [])

  useEffect(() => {
    void check()
    const id = setInterval(check, 5000)
    return () => clearInterval(id)
  }, [check])

  return healthy
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [load])

  return { orders, loading, error, reload: load }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<BaristaNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBaristaNotifications()
      setNotifications(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [load])

  return { notifications, loading, error, reload: load }
}

export function useCreateOrder() {
  const [submitting, setSubmitting] = useState(false)

  async function submit(input: {
    customerName: string
    drink: string
    size: string
    quantity: number
  }) {
    setSubmitting(true)
    try {
      return await createOrder(input)
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting }
}
