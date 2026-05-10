'use client'

import { useState } from 'react'
import { Trash2, ChevronDown, ChevronRight, ImageIcon, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderItemDraft } from '../page'
import { PhotoUploadZone } from './PhotoUploadZone'
import { ComboboxField } from './ComboboxField'

type Props = {
  item: OrderItemDraft
  index: number
  errors: Record<string, string>
  onUpdate: (localId: string, field: keyof Omit<OrderItemDraft, 'localId' | 'photos'>, value: string | number) => void
  onRemove: () => void
  onAddPhoto: (file: File, itemLocalId: string) => void
  onRemovePhoto: (itemLocalId: string, photoLocalId: string) => void
  showRemove: boolean
  familyOptions: string[]
  materialOptions: string[]
  onAddFamilyOption: (opt: string) => void
  onAddMaterialOption: (opt: string) => void
  onCopyFromPrevious?: () => void
}

const ROW_BG = ['bg-white', 'bg-zinc-50/70']

export function OrderItemCard({
  item, index, errors, onUpdate, onRemove, onAddPhoto, onRemovePhoto, showRemove,
  familyOptions, materialOptions, onAddFamilyOption, onAddMaterialOption,
  onCopyFromPrevious,
}: Props) {
  const [expanded, setExpanded] = useState(item.product_name === '')
  const [focused, setFocused] = useState(false)

  const hasError = !!(errors[`${item.localId}.product_name`] || errors[`${item.localId}.quantity`])
  const rowBg = ROW_BG[index % 2]

  const secondaryParts = [item.material, item.measurements, item.weight].filter(Boolean)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (!target.closest('input, textarea, button, select, a')) {
      e.currentTarget.focus()
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) onAddPhoto(file, item.localId)
    }
  }

  const ringClass = hasError
    ? 'ring-2 ring-red-400'
    : focused
    ? 'ring-2 ring-blue-500'
    : 'ring-1 ring-zinc-200'

  return (
    <div
      tabIndex={-1}
      className={`rounded-xl overflow-hidden outline-none transition-shadow ${ringClass}`}
      onClick={handleClick}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onPaste={handlePaste}
    >
      {/* ── Fila colapsada ──────────────────────────────────────── */}
      <div
        className={`flex items-center gap-4 px-5 py-4 cursor-pointer select-none ${rowBg} hover:bg-blue-50/30 transition-colors`}
        onClick={() => setExpanded(prev => !prev)}
      >
        {/* Chevron + índice */}
        <div className="flex items-center gap-2 flex-shrink-0 w-8">
          <span className="text-zinc-300">
            {expanded
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />}
          </span>
        </div>

        <span className="text-sm font-bold text-zinc-300 w-5 flex-shrink-0 text-right">{index + 1}</span>

        {/* Info principal */}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {item.family && (
              <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 border border-indigo-100">
                {item.family}
              </span>
            )}
            <span className={`text-base font-semibold truncate leading-tight ${item.product_name ? 'text-zinc-800' : 'text-zinc-400 italic font-normal'}`}>
              {item.product_name || 'Nuevo producto'}
            </span>
          </div>

          {/* Línea secundaria: material · medidas · descripción */}
          {(secondaryParts.length > 0 || item.description) && !expanded && (
            <p className="text-sm text-zinc-400 truncate">
              {[...secondaryParts, item.description].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Derecha: fotos + cantidad + eliminar */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {item.photos.length > 0 && !expanded && (
            <span className="flex items-center gap-1 text-sm text-zinc-400">
              <ImageIcon className="w-3.5 h-3.5" />
              {item.photos.length}
            </span>
          )}
          {item.quantity !== '' && (
            <div className="text-right">
              <span className="text-xl font-bold text-zinc-700 leading-none">
                {item.quantity}
              </span>
              <span className="text-xs text-zinc-400 ml-1">ud.</span>
            </div>
          )}
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="h-8 w-8 p-0 text-zinc-300 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Formulario expandido ────────────────────────────────── */}
      {expanded && (
        <div className="flex flex-col gap-5 px-6 pb-6 pt-4 bg-white border-t border-zinc-100">

          {/* Copiar del anterior */}
          {onCopyFromPrevious && (
            <button
              type="button"
              onClick={onCopyFromPrevious}
              className="self-start flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 hover:underline transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar datos del producto anterior
            </button>
          )}

          {/* Fila 1: Familia + Producto */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Familia
              </Label>
              <ComboboxField
                value={item.family}
                onChange={val => onUpdate(item.localId, 'family', val)}
                options={familyOptions}
                onAddOption={onAddFamilyOption}
                placeholder="Ej: VASOS"
              />
            </div>
            <div className="col-span-3 flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Producto <span className="text-red-400">*</span>
              </Label>
              <Input
                value={item.product_name}
                onChange={e => onUpdate(item.localId, 'product_name', e.target.value)}
                placeholder="Ej: Vasos papel 12 oz kraft doble pared"
                className={`h-11 text-base font-semibold ${errors[`${item.localId}.product_name`] ? 'border-red-400' : ''}`}
              />
              {errors[`${item.localId}.product_name`] && (
                <p className="text-xs text-red-500">{errors[`${item.localId}.product_name`]}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Material + Medidas + Peso + Cantidad */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Material</Label>
              <ComboboxField
                value={item.material}
                onChange={val => onUpdate(item.localId, 'material', val)}
                options={materialOptions}
                onAddOption={onAddMaterialOption}
                placeholder="Ej: KRAFT"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Medidas</Label>
              <Input
                value={item.measurements}
                onChange={e => onUpdate(item.localId, 'measurements', e.target.value)}
                placeholder="Ej: 350ml"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Gramaje / Peso</Label>
              <Input
                value={item.weight}
                onChange={e => onUpdate(item.localId, 'weight', e.target.value)}
                placeholder="Ej: 950cc"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cantidad <span className="text-red-400">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => onUpdate(item.localId, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="0"
                className={`h-11 text-lg font-bold ${errors[`${item.localId}.quantity`] ? 'border-red-400' : ''}`}
              />
              {errors[`${item.localId}.quantity`] && (
                <p className="text-xs text-red-500">{errors[`${item.localId}.quantity`]}</p>
              )}
            </div>
          </div>

          {/* Fila 3: Descripción */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Descripción</Label>
            <Input
              value={item.description}
              onChange={e => onUpdate(item.localId, 'description', e.target.value)}
              placeholder="Ej: Doble pared, base negra, tapa transparente"
            />
          </div>

          {/* Fila 4: Fotos */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Fotos</Label>
            <PhotoUploadZone
              photos={item.photos}
              onAddPhoto={file => onAddPhoto(file, item.localId)}
              onRemovePhoto={photoLocalId => onRemovePhoto(item.localId, photoLocalId)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
