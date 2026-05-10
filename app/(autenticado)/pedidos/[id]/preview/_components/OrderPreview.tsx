import Image from 'next/image'

type Item = {
  id: string
  family: string | null
  product_name: string
  material: string | null
  measurements: string | null
  weight: string | null
  description: string | null
  quantity: number
  order_item_photos: { id: string; url: string }[]
}

type Props = {
  order: {
    created_at: string
    notes: string | null
    order_items: Item[]
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(dateStr))
}

export function OrderPreview({ order }: Props) {
  // Group by family preserving sort order
  const families: string[] = []
  order.order_items.forEach(item => {
    const f = item.family || ''
    if (!families.includes(f)) families.push(f)
  })

  return (
    <div className="flex flex-col gap-6">
      {families.map(family => {
        const items = order.order_items.filter(i => (i.family || '') === family)
        return (
          <div key={family}>
            {family && (
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500">
                  {family}
                </span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
            )}

            <div className="flex flex-col divide-y divide-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
              {items.map((item, idx) => {
                const metaParts = [item.material, item.measurements, item.weight].filter(Boolean)
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 px-5 py-4 ${idx % 2 === 1 ? 'bg-zinc-50/70' : 'bg-white'}`}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-zinc-900 leading-tight">
                        {item.product_name}
                      </p>
                      {metaParts.length > 0 && (
                        <p className="text-sm text-zinc-500 mt-0.5">{metaParts.join(' · ')}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-zinc-500 mt-0.5">{item.description}</p>
                      )}
                      {item.order_item_photos.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {item.order_item_photos.map(photo => (
                            <div
                              key={photo.id}
                              className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0"
                            >
                              <Image
                                src={photo.url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="flex-shrink-0 text-right">
                      <span className="text-2xl font-bold text-zinc-800 leading-none">
                        {item.quantity}
                      </span>
                      <p className="text-xs text-zinc-400 mt-0.5">ud.</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {order.notes && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Nota general</p>
          <p className="text-sm text-zinc-700">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
