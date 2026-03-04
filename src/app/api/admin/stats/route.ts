import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(request: Request) {
  const pw = request.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const err = checkAdmin(request)
  if (err) return err

  // Products count
  const { count: productCount } = await supabase
    .from('tb_products')
    .select('*', { count: 'exact', head: true })

  // Total orders
  const { count: orderCount } = await supabase
    .from('tb_orders')
    .select('*', { count: 'exact', head: true })

  // Pending orders
  const { count: pendingCount } = await supabase
    .from('tb_orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'preparing', 'ready'])

  // Total revenue (completed)
  const { data: completedOrders } = await supabase
    .from('tb_orders')
    .select('total_amount')
    .eq('status', 'completed')

  const totalRevenue = completedOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  // Categories count
  const { count: categoryCount } = await supabase
    .from('tb_categories')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    products: productCount || 0,
    categories: categoryCount || 0,
    orders: orderCount || 0,
    pendingOrders: pendingCount || 0,
    totalRevenue,
  })
}

