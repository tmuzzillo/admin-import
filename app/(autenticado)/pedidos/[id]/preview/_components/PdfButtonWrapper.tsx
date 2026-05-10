'use client'

import dynamic from 'next/dynamic'

export const PdfDownloadButton = dynamic(
  () => import('./PdfDownloadButton').then(m => m.PdfDownloadButton),
  { ssr: false, loading: () => null }
)
