import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((s) => {
      const found = s.items.find((i) => i.id === item.id)
      if (found) {
        return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)) }
      }
      return { items: [...s.items, item] }
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))

export const useCartItems = () => useCartStore((s) => s.items)
export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
export const useCartTotal = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.price * i.qty, 0))
