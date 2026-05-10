'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { OrderItemDraft } from '../page'

type PreviousOrder = {
  id: string
  created_at: string
  item_count: number
}

type Props = {
  open: boolean
  onClose: () => void
  onCopy: (items: OrderItemDraft[]) => void
}

export function CopyOrderModal({ open, onClose, onCopy }: Props) {
  const [orders, setOrders] = useState<PreviousOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    setLoading(true)
    supabase
      .from('orders')
      .select('id, created_at, order_items(count)')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setOrders(
          (data ?? []).map(o => ({
            id: o.id,
            created_at: o.created_at,
            item_count: (o.order_items as unknown as { count: number }[])?.[0]?.count ?? 0,
          }))
        )
        setLoading(false)
      })
  }, [open])

  async function handleSelect(orderId: string) {
    setCopying(orderId)
    const supabase = createClient()
    const { data } = await supabase
      .from('order_items')
      .select('*, order_item_photos(*)')
      .eq('order_id', orderId)
      .order('sort_order')

    if (!data) {
      setCopying(null)
      return
    }

    const copiedItems: OrderItemDraft[] = data.map(item => ({
      localId: crypto.randomUUID(),
      family: item.family ?? '',
      product_name: item.product_name,
      material: item.material ?? '',
      measurements: item.measurements ?? '',
      weight: item.weight ?? '',
      description: item.description ?? '',
      quantity: item.quantity,
      photos: (item.order_item_photos ?? []).map((p: { id: string; url: string; filename: string | null }) => ({
        localId: crypto.randomUUID(),
        url: p.url,
        filename: p.filename ?? '',
        uploading: false,
      })),
    }))

    onCopy(copiedItems)
    setCopying(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copiar pedido anterior</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-zinc-500 py-4 text-center">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">No hay pedidos anteriores.</p>
        ) : (
          <div className="flex flex-col gap-2 py-2 max-h-80 overflow-y-auto">
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => handleSelect(order.id)}
                disabled={!!copying}
                className="flex items-center justify-between w-full rounded-lg border border-zinc-200 px-4 py-3 text-left hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
                      new Date(order.created_at)
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {order.item_count} producto{order.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-sm text-zinc-400 ml-4 flex-shrink-0">
                  {copying === order.id ? 'Copiando...' : 'Usar este →'}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
