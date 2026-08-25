import type { CartItem } from '../stores/cart.store'
import { api } from './http'

export interface CheckoutRequest {
  items: CartItem[]
}

export interface CheckoutResponse {
  message: string
  total: number
}

export function checkout(items: CartItem[]): Promise<CheckoutResponse> {
  return api<CheckoutResponse>('/api/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ items } satisfies CheckoutRequest),
  })
}
