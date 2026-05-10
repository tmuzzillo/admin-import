'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createOrder } from './actions'
import { OrderItemCard } from './_components/OrderItemCard'
import { CopyOrderModal } from './_components/CopyOrderModal'
import { FamilyDivider } from './_components/FamilyDivider'

export type PhotoDraft = {
  localId: string
  url: string
  filename: string
  uploading: boolean
  error?: string
}

export type OrderItemDraft = {
  localId: string
  family: string
  product_name: string
  material: string
  measurements: string
  weight: string
  description: string
  quantity: number | ''
  photos: PhotoDraft[]
}

function emptyItem(): OrderItemDraft {
  return {
    localId: crypto.randomUUID(),
    family: '',
    product_name: '',
    material: '',
    measurements: '',
    weight: '',
    description: '',
    quantity: '',
    photos: [],
  }
}

const DEFAULT_FAMILIES = ['VASOS', 'BOWLS', 'VARIOS']
const DEFAULT_MATERIALS = ['KRAFT', 'PET']

function sortByFamily(items: OrderItemDraft[]): OrderItemDraft[] {
  // Familias en el orden en que aparecen por primera vez
  const familyOrder: string[] = []
  items.forEach(item => {
    if (item.family && !familyOrder.includes(item.family)) {
      familyOrder.push(item.family)
    }
  })
  const withFamily = familyOrder.flatMap(family => items.filter(i => i.family === family))
  const withoutFamily = items.filter(i => !i.family)
  return [...withFamily, ...withoutFamily]
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [items, setItems] = useState<OrderItemDraft[]>([emptyItem()])
  const [generalNotes, setGeneralNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copyModalOpen, setCopyModalOpen] = useState(false)
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
      const updated = prev.map(item => (item.localId === localId ? { ...item, [field]: value } : item))
      return field === 'family' ? sortByFamily(updated) : updated
    })
    setErrors(prev => {
      const next = { ...prev }
      delete next[`${localId}.${field}`]
      return next
    })
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
        ? {
            ...item,
            family: source.family,
            product_name: source.product_name,
            material: source.material,
            measurements: source.measurements,
            weight: source.weight,
            description: source.description,
            photos: source.photos,
          }
        : item
    ))
  }

  async function handlePhotoAdd(file: File, itemLocalId: string) {
    const photoLocalId = crypto.randomUUID()
    const supabase = createClient()

    setItems(prev =>
      prev.map(item =>
        item.localId === itemLocalId
          ? {
              ...item,
              photos: [
                ...item.photos,
                { localId: photoLocalId, url: '', filename: file.name, uploading: true },
              ],
            }
          : item
      )
    )

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${photoLocalId.slice(0, 8)}.${ext}`
    const path = `temp/${itemLocalId}/${filename}`

    const { error } = await supabase.storage.from('order-photos').upload(path, file)

    if (error) {
      setItems(prev =>
        prev.map(item =>
          item.localId === itemLocalId
            ? {
                ...item,
                photos: item.photos.map(p =>
                  p.localId === photoLocalId ? { ...p, uploading: false, error: 'Error al subir' } : p
                ),
              }
            : item
        )
      )
      return
    }

    const { data } = supabase.storage.from('order-photos').getPublicUrl(path)
    setItems(prev =>
      prev.map(item =>
        item.localId === itemLocalId
          ? {
              ...item,
              photos: item.photos.map(p =>
                p.localId === photoLocalId
                  ? { ...p, url: data.publicUrl, filename: file.name, uploading: false }
                  : p
              ),
            }
          : item
      )
    )
  }

  function removePhoto(itemLocalId: string, photoLocalId: string) {
    setItems(prev =>
      prev.map(item =>
        item.localId === itemLocalId
          ? { ...item, photos: item.photos.filter(p => p.localId !== photoLocalId) }
          : item
      )
    )
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

    const result = await createOrder(
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

    if ('error' in result) {
      setErrors({ general: result.error })
      return
    }

    router.push(`/pedidos/${result.orderId}/preview`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Nuevo pedido</h1>
        <Button variant="outline" size="sm" onClick={() => setCopyModalOpen(true)}>
          Copiar pedido anterior
        </Button>
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

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setItems(prev => [...prev, emptyItem()])}
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar producto
      </Button>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Nota general del pedido (opcional)</Label>
        <Textarea
          id="notes"
          value={generalNotes}
          onChange={e => setGeneralNotes(e.target.value)}
          placeholder="Ej: Consultar disponibilidad antes de confirmar"
          rows={3}
        />
      </div>

      {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

      <div className="flex justify-end pt-2 pb-8">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Guardando...' : 'Guardar pedido'}
        </Button>
      </div>

      <CopyOrderModal
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        onCopy={copiedItems => {
          setItems(copiedItems)
          setCopyModalOpen(false)
        }}
      />
    </div>
  )
}
