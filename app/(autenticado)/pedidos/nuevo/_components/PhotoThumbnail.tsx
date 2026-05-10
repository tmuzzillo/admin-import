'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import type { PhotoDraft } from '../page'

type Props = {
  photo: PhotoDraft
  onRemove: () => void
}

export function PhotoThumbnail({ photo, onRemove }: Props) {
  return (
    <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 group flex-shrink-0">
      {photo.uploading ? (
        <div className="h-full w-full bg-zinc-100 animate-pulse flex items-center justify-center">
          <span className="text-xs text-zinc-400">...</span>
        </div>
      ) : photo.error ? (
        <div className="h-full w-full bg-red-50 flex items-center justify-center px-1">
          <span className="text-xs text-red-400 text-center leading-tight">Error al subir</span>
        </div>
      ) : (
        <Image
          src={photo.url}
          alt={photo.filename}
          fill
          className="object-cover"
          sizes="64px"
        />
      )}
      {!photo.uploading && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  )
}
