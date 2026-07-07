import { useState, useCallback, useMemo } from 'react'
import type { CartLine } from '@/types'

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([])

  const add = useCallback((line: Omit<CartLine, 'key'>) => {
    setLines((prev) => {
      const key = `${line.drink}-${line.size}`
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l,
        )
      }
      return [...prev, { ...line, key }]
    })
  }, [])

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    [lines],
  )

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  )

  return { lines, add, remove, setQuantity, clear, total, count }
}