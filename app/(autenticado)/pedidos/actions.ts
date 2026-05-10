'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markAsCompleted(orderId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId)
    .eq('status', 'draft')

  if (error) return { error: 'No se pudo actualizar el pedido' }

  revalidatePath('/pedidos')
  revalidatePath(`/pedidos/${orderId}/preview`)
  return {}
}
