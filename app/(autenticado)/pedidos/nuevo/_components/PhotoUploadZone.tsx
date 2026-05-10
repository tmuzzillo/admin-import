'use client'

import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PhotoDraft } from '../page'
import { PhotoThumbnail } from './PhotoThumbnail'

type Props = {
  photos: PhotoDraft[]
  onAddPhoto: (file: File) => void
  onRemovePhoto: (photoLocalId: string) => void
}

export function PhotoUploadZone({ photos, onAddPhoto, onRemovePhoto }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach(file => onAddPhoto(file))
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {photos.map(photo => (
          <PhotoThumbnail
            key={photo.localId}
            photo={photo}
            onRemove={() => onRemovePhoto(photo.localId)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-16 w-16 flex flex-col gap-1 text-zinc-500 border-dashed flex-shrink-0"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs">Foto</span>
        </Button>
      </div>
      <p className="text-xs text-zinc-400">
        También podés pegar una imagen con Ctrl+V / Cmd+V mientras estás en este producto
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
