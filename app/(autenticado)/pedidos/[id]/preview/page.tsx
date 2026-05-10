import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderPreview } from './_components/OrderPreview'
import { PdfDownloadButton } from './_components/PdfButtonWrapper'

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_photos(*))')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'order_items' })
    .single()

  if (error) console.error('Preview fetch error:', error)
  if (!order) notFound()

  const formattedDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
    new Date(order.created_at)
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/pedidos"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a pedidos
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">Pedido</h1>
            {order.status === 'completed' && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100">
                Realizado
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          {order.status === 'draft' && (
            <Link
              href={`/pedidos/${id}/editar`}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 hover:bg-zinc-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Link>
          )}
          <PdfDownloadButton order={order} />
        </div>
      </div>

      {/* Contenido del pedido */}
      <OrderPreview order={order} />
    </div>
  )
}
