'use client'

import { Button } from '@/components/ui/button'
import type { OrderItemDraft } from '../page'

type Props = {
  items: OrderItemDraft[]
  saving: boolean
  onSave: () => void
}

export function StickyFooter({ items, saving, onSave }: Props) {
  const validItems = items.filter(i => i.product_name.trim())
  const families = [...new Set(items.map(i => i.family).filter(Boolean))]

  const summary = [
    `${validItems.length} producto${validItems.length !== 1 ? 's' : ''}`,
    families.length > 0 && `${families.length} famili${families.length !== 1 ? 'as' : 'a'}`,
  ].filter(Boolean).join(' · ')

  return (
    <div className="fixed bottom-0 right-0 left-56 bg-white border-t border-zinc-200 px-8 py-3 flex items-center justify-between z-10">
      <p className="text-sm text-zinc-400">{summary}</p>
      <Button onClick={onSave} disabled={saving} size="lg" className="min-w-36">
        {saving ? 'Guardando...' : 'Guardar pedido'}
      </Button>
    </div>
  )
}
