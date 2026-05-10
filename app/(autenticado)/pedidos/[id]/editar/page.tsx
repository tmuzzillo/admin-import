import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditOrderForm } from './_components/EditOrderForm'

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_photos(*))')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'order_items' })
    .single()

  if (!order) notFound()
  if (order.status !== 'draft') redirect(`/pedidos/${id}/preview`)

  return <EditOrderForm order={order} />
}
