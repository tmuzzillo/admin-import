import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MarkCompletedButton } from './_components/MarkCompletedButton'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(dateStr))
}

function getFamilyCounts(items: { family: string | null }[]) {
  const counts: Record<string, number> = {}
  items.forEach(({ family }) => {
    const key = family?.trim() || ''
    if (!key) return
    counts[key] = (counts[key] ?? 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100">
        Realizado
      </span>
    )
  }
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 border border-zinc-200">
      Borrador
    </span>
  )
}

export default async function PedidosPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, created_at, status, order_items(family)')
    .order('created_at', { ascending: false })

  const list = (orders ?? []).map(o => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status as string,
    families: getFamilyCounts(o.order_items as { family: string | null }[]),
    total: (o.order_items as { family: string | null }[]).length,
  }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
        <Link href="/pedidos/nuevo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo pedido
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-zinc-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-700">Todavía no hay pedidos</p>
            <p className="text-sm text-zinc-400 mt-1">Creá el primero para empezar</p>
          </div>
          <Link href="/pedidos/nuevo">
            <Button variant="outline">Crear el primero</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          {list.map((order, idx) => (
            <div
              key={order.id}
              className={`flex items-center justify-between px-6 py-4 gap-4 ${
                idx % 2 === 1 ? 'bg-zinc-50/60' : 'bg-white'
              }`}
            >
              {/* Info */}
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-zinc-900">
                    {formatDate(order.created_at)}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {order.families.length > 0 ? (
                    order.families.map(([family, count]) => (
                      <span
                        key={family}
                        className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 border border-indigo-100"
                      >
                        {family} ×{count}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-400">
                      {order.total} producto{order.total !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {order.status === 'draft' && (
                  <>
                    <MarkCompletedButton orderId={order.id} />
                    <Link
                      href={`/pedidos/${order.id}/editar`}
                      className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Editar
                    </Link>
                  </>
                )}
                <Link
                  href={`/pedidos/${order.id}/preview`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Ver →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
