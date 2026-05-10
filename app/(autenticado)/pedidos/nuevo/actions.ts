'use server'

import { createClient } from '@/lib/supabase/server'

type PhotoInput = {
  url: string
  filename: string
}

type OrderItemInput = {
  family: string
  product_name: string
  material: string
  measurements: string
  weight: string
  description: string
  quantity: number
  sort_order: number
  photos: PhotoInput[]
}

export async function createOrder(
  items: OrderItemInput[],
  notes: string
): Promise<{ orderId: string } | { error: string }> {
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ notes: notes || null })
    .select()
    .single()

  if (orderError || !order) {
    return { error: 'Error al crear el pedido' }
  }

  for (const item of items) {
    const { data: dbItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        family: item.family || null,
        product_name: item.product_name,
        material: item.material || null,
        measurements: item.measurements || null,
        weight: item.weight || null,
        description: item.description || null,
        quantity: item.quantity,
        sort_order: item.sort_order,
      })
      .select()
      .single()

    if (itemError || !dbItem) {
      await supabase.from('orders').delete().eq('id', order.id)
      return { error: 'Error al guardar los productos' }
    }

    if (item.photos.length > 0) {
      await supabase.from('order_item_photos').insert(
        item.photos.map((p, i) => ({
          order_item_id: dbItem.id,
          url: p.url,
          filename: p.filename,
          sort_order: i,
        }))
      )
    }
  }

  return { orderId: order.id }
}
