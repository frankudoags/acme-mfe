import type { Product } from '../types'
import { api } from './http'

export function fetchProducts(): Promise<Product[]> {
  return api<Product[]>('/api/products')
}
