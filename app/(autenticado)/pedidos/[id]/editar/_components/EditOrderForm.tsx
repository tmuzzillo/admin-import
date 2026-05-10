'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { updateOrder } from '../actions'
import { OrderItemCard } from '@/app/(autenticado)/pedidos/nuevo/_components/OrderItemCard'
import { FamilyDivider } from '@/app/(autenticado)/pedidos/nuevo/_components/FamilyDivider'
import { StickyFooter } from '@/app/(autenticado)/pedidos/nuevo/_components/StickyFooter'
import type { PhotoDraft, OrderItemDraft } from '@/app/(autenticado)/pedidos/nuevo/page'

const DEFAULT_FAMILIES = ['VASOS', 'BOWLS', 'VARIOS']
const DEFAULT_MATERIALS = ['KRAFT', 'PET']

function sortByFamily(items: OrderItemDraft[]): OrderItemDraft[] {
  const familyOrder: string[] = []
  items.forEach(item => {
    if (item.family && !familyOrder.includes(item.family)) familyOrder.push(item.family)
  })
  return [
    ...familyOrder.flatMap(family => items.filter(i => i.family === family)),
    ...items.filter(i => !i.family),
  ]
}

type DbOrder = {
  id: string
  notes: string | null
  order_items: {
    id: string
    family: string | null
    product_name: string
    material: string | null
    measurements: string | null
    weight: string | null
    description: string | null
    quantity: number
    sort_order: number
    order_item_photos: { id: string; url: string; filename: string | null; sort_order: number }[]
  }[]
}

type Props = { order: DbOrder }

export function EditOrderForm({ order }: Props) {
  const router = useRouter()

  const initialItems: OrderItemDraft[] = order.order_items.map(item => ({
    localId: crypto.randomUUID(),
    family: item.family ?? '',
    product_name: item.product_name,
    material: item.material ?? '',
    measurements: item.measurements ?? '',
    weight: item.weight ?? '',
    description: item.description ?? '',
    quantity: item.quantity,
    photos: item.order_item_photos
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(p => ({
        localId: crypto.randomUUID(),
        url: p.url,
        filename: p.filename ?? '',
        uploading: false,
      })),
  }))

  const [items, setItems] = useState<OrderItemDraft[]>(initialItems)
  const [generalNotes, setGeneralNotes] = useState(order.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [familyOptions, setFamilyOptions] = useState<string[]>(DEFAULT_FAMILIES)
  const [materialOptions, setMaterialOptions] = useState<string[]>(DEFAULT_MATERIALS)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('order_items').select('family').not('family', 'is', null),
      supabase.from('order_items').select('material').not('material', 'is', null),
    ]).then(([{ data: families }, { data: materials }]) => {
      if (families) {
        const fromDb = [...new Set(families.map(f => f.family).filter(Boolean))] as string[]
        setFamilyOptions(prev => [...new Set([...prev, ...fromDb])])
      }
      if (materials) {
        const fromDb = [...new Set(materials.map(m => m.material).filter(Boolean))] as string[]
        setMaterialOptions(prev => [...new Set([...prev, ...fromDb])])
      }
    })
  }, [])

  function updateItem(
    localId: string,
    field: keyof Omit<OrderItemDraft, 'localId' | 'photos'>,
    value: string | number
  ) {
    setItems(prev => {
      const updated = prev.map(item => item.localId === localId ? { ...item, [field]: value } : item)
      return field === 'family' ? sortByFamily(updated) : updated
    })
    setErrors(prev => { const next = { ...prev }; delete next[`${localId}.${field}`]; return next })
  }

  function removeItem(localId: string) {
    setItems(prev => prev.filter(item => item.localId !== localId))
  }

  function copyFromPrevious(localId: string) {
    const idx = items.findIndex(i => i.localId === localId)
    if (idx <= 0) return
    const source = items[idx - 1]
    setItems(prev => prev.map(item =>
      item.localId === localId
        ? { ...item, family: source.family, product_name: source.product_name, material: source.material, measurements: source.measurements, weight: source.weight, description: source.description, photos: source.photos }
        : item
    ))
  }

  async function handlePhotoAdd(file: File, itemLocalId: string) {
    const photoLocalId = crypto.randomUUID()
    const supabase = createClient()

    setItems(prev => prev.map(item =>
      item.localId === itemLocalId
        ? { ...item, photos: [...item.photos, { localId: photoLocalId, url: '', filename: file.name, uploading: true }] }
        : item
    ))

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${photoLocalId.slice(0, 8)}.${ext}`
    const path = `temp/${itemLocalId}/${filename}`
    const { error } = await supabase.storage.from('order-photos').upload(path, file)

    if (error) {
      setItems(prev => prev.map(item =>
        item.localId === itemLocalId
          ? { ...item, photos: item.photos.map(p => p.localId === photoLocalId ? { ...p, uploading: false, error: 'Error al subir' } : p) }
          : item
      ))
      return
    }

    const { data } = supabase.storage.from('order-photos').getPublicUrl(path)
    setItems(prev => prev.map(item =>
      item.localId === itemLocalId
        ? { ...item, photos: item.photos.map(p => p.localId === photoLocalId ? { ...p, url: data.publicUrl, filename: file.name, uploading: false } : p) }
        : item
    ))
  }

  function removePhoto(itemLocalId: string, photoLocalId: string) {
    setItems(prev => prev.map(item =>
      item.localId === itemLocalId
        ? { ...item, photos: item.photos.filter(p => p.localId !== photoLocalId) }
        : item
    ))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    items.forEach(item => {
      if (!item.product_name.trim()) newErrors[`${item.localId}.product_name`] = 'Requerido'
      if (!item.quantity || Number(item.quantity) < 1) newErrors[`${item.localId}.quantity`] = 'Requerido'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const result = await updateOrder(
      order.id,
      items.map((item, index) => ({
        family: item.family,
        product_name: item.product_name,
        material: item.material,
        measurements: item.measurements,
        weight: item.weight,
        description: item.description,
        quantity: item.quantity as number,
        sort_order: index,
        photos: item.photos
          .filter(p => p.url && !p.uploading && !p.error)
          .map(p => ({ url: p.url, filename: p.filename })),
      })),
      generalNotes
    )

    setSaving(false)
    if (result.error) { setErrors({ general: result.error }); return }
    router.push(`/pedidos/${order.id}/preview`)
  }

  function emptyItem(): OrderItemDraft {
    return { localId: crypto.randomUUID(), family: '', product_name: '', material: '', measurements: '', weight: '', description: '', quantity: '', photos: [] }
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/pedidos/${order.id}/preview`} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al pedido
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Editar pedido</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const prevFamily = index > 0 ? items[index - 1].family.trim() : null
          const thisFamily = item.family.trim()
          const showDivider = thisFamily && thisFamily !== prevFamily
          return (
            <Fragment key={item.localId}>
              {showDivider && <FamilyDivider family={thisFamily} />}
              <OrderItemCard
                item={item}
                index={index}
                errors={errors}
                onUpdate={updateItem}
                onRemove={() => removeItem(item.localId)}
                onAddPhoto={handlePhotoAdd}
                onRemovePhoto={removePhoto}
                showRemove={items.length > 1}
                familyOptions={familyOptions}
                materialOptions={materialOptions}
                onAddFamilyOption={opt => setFamilyOptions(prev => [...new Set([...prev, opt])])}
                onAddMaterialOption={opt => setMaterialOptions(prev => [...new Set([...prev, opt])])}
                onCopyFromPrevious={index > 0 ? () => copyFromPrevious(item.localId) : undefined}
              />
            </Fragment>
          )
        })}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={() => setItems(prev => [...prev, emptyItem()])}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar producto
      </Button>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Nota general del pedido (opcional)</Label>
        <Textarea id="notes" value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} placeholder="Ej: Consultar disponibilidad antes de confirmar" rows={3} />
      </div>

      {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

      <StickyFooter items={items} saving={saving} onSave={handleSave} />
    </div>
  )
}
