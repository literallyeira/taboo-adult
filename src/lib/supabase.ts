import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as ReturnType<typeof createClient>

// ---------- Types ----------

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  in_stock: boolean
  sort_order: number
  created_at: string
}

export type DeliveryType = 'pickup' | 'delivery'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  notes: string | null
  delivery_type: DeliveryType
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  // joined
  product?: Product
}

export interface OrderWithItems extends Order {
  tb_order_items: OrderItem[]
}
