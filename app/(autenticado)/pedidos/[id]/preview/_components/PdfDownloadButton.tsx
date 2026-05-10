'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderDocument, type PdfOrder, type PdfItem } from './OrderDocument'

type DbItem = {
  id: string
  family: string | null
  product_name: string
  material: string | null
  measurements: string | null
  weight: string | null
  description: string | null
  quantity: number
  order_item_photos: { url: string; filename: string | null }[]
}

type Props = {
  order: {
    id: string
    created_at: string
    notes: string | null
    order_items: DbItem[]
  }
}

async function fetchAsBlobUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return ''
  }
}

export function PdfDownloadButton({ order }: Props) {
  const [loading, setLoading] = useState(false)

  const filename = `pedido-${new Date(order.created_at).toISOString().slice(0, 10)}.pdf`

  async function handleDownload() {
    setLoading(true)
    try {
      const items: PdfItem[] = await Promise.all(
        order.order_items.map(async item => ({
          id: item.id,
          family: item.family,
          product_name: item.product_name,
          material: item.material,
          measurements: item.measurements,
          weight: item.weight,
          description: item.description,
          quantity: item.quantity,
          photos: await Promise.all(
            item.order_item_photos.map(async p => ({
              url: p.url,
              blobUrl: await fetchAsBlobUrl(p.url),
            }))
          ),
        }))
      )

      const pdfOrder: PdfOrder = {
        id: order.id,
        created_at: order.created_at,
        notes: order.notes,
        items,
      }

      const blob = await pdf(<OrderDocument order={pdfOrder} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="lg" onClick={handleDownload} disabled={loading} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Descargar PDF
        </>
      )}
    </Button>
  )
}
