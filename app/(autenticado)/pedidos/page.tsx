import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(dateStr))
}

export default async function PedidosPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, created_at, order_items(count)')
    .order('created_at', { ascending: false })

  const list = (orders ?? []).map(o => ({
    id: o.id,
    created_at: o.created_at,
    item_count: (o.order_items as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Pedidos</h1>
        <Link href="/pedidos/nuevo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo pedido
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <p className="text-base font-medium text-zinc-700">Todavía no hay pedidos</p>
            <p className="text-sm text-zinc-400 mt-1">Creá el primero para empezar</p>
          </div>
          <Link href="/pedidos/nuevo">
            <Button variant="outline">Crear el primero</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
          {list.map((order, idx) => (
            <Link
              key={order.id}
              href={`/pedidos/${order.id}/preview`}
              className={`flex items-center justify-between px-5 py-4 hover:bg-blue-50/30 transition-colors ${
                idx % 2 === 1 ? 'bg-zinc-50/70' : 'bg-white'
              }`}
            >
              <div>
                <p className="text-base font-semibold text-zinc-900">{formatDate(order.created_at)}</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {order.item_count} producto{order.item_count !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-sm text-zinc-400">Ver →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
