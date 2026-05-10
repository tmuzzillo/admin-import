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

export async function updateOrder(
  orderId: string,
  items: OrderItemInput[],
  notes: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Verificar que el pedido existe y es draft
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single()

  if (!order || order.status !== 'draft') {
    return { error: 'El pedido no se puede editar' }
  }

  // Borrar ítems existentes (cascade borra order_item_photos)
  await supabase.from('order_items').delete().eq('order_id', orderId)

  // Actualizar notas del pedido
  await supabase.from('orders').update({ notes: notes || null }).eq('id', orderId)

  // Re-insertar ítems + fotos
  for (const item of items) {
    const { data: dbItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
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

    if (itemError || !dbItem) return { error: 'Error al guardar los productos' }

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

  return {}
}
