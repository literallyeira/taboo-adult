import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_address, notes, delivery_type, items } = body

    if (!customer_name || !customer_phone || !customer_address || !items?.length) {
      return NextResponse.json({ error: 'Ad-soyad, telefon, adres ve en az bir ürün gerekli' }, { status: 400 })
    }

    // Validate delivery type
    const validDeliveryTypes = ['pickup', 'delivery']
    const safeDeliveryType = validDeliveryTypes.includes(delivery_type) ? delivery_type : 'pickup'

    // Validate products exist and calculate total
    const productIds = items.map((i: { product_id: string }) => i.product_id)
    const { data: products, error: pErr } = await supabase
      .from('tb_products')
      .select('id, price, in_stock, name')
      .in('id', productIds)

    if (pErr || !products) {
      return NextResponse.json({ error: 'Ürünler doğrulanamadı' }, { status: 500 })
    }

    const priceMap = new Map(products.map(p => [p.id, p]))
    let totalAmount = 0
    const orderItems: { product_id: string; quantity: number; unit_price: number }[] = []

    for (const item of items) {
      const product = priceMap.get(item.product_id)
      if (!product) return NextResponse.json({ error: `Ürün bulunamadı: ${item.product_id}` }, { status: 400 })
      if (!product.in_stock) return NextResponse.json({ error: `${product.name} stokta yok` }, { status: 400 })

      const qty = Math.max(1, Math.floor(item.quantity || 1))
      const unitPrice = product.price
      totalAmount += unitPrice * qty
      orderItems.push({ product_id: item.product_id, quantity: qty, unit_price: unitPrice })
    }

    // Create order
    const { data: order, error: oErr } = await supabase
      .from('tb_orders')
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_address: customer_address.trim(),
        notes: notes?.trim() || null,
        delivery_type: safeDeliveryType,
        status: 'pending',
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (oErr || !order) return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 })

    // Create order items
    const itemsToInsert = orderItems.map(oi => ({ ...oi, order_id: order.id }))
    const { error: iErr } = await supabase.from('tb_order_items').insert(itemsToInsert)

    if (iErr) return NextResponse.json({ error: 'Sipariş oluşturuldu fakat ürünler eklenemedi' }, { status: 500 })

    return NextResponse.json({ id: order.id, status: order.status, total_amount: order.total_amount })
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
  }
}
