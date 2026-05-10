'use client'

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const C = {
  black: '#18181b',
  dark: '#27272a',
  mid: '#52525b',
  light: '#71717a',
  muted: '#a1a1aa',
  border: '#d4d4d8',
  borderLight: '#f4f4f5',
  bgAlt: '#fafafa',
  indigo: '#4f46e5',
  indigoBg: '#eef2ff',
  indigoBorder: '#c7d2fe',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 36,
    color: C.dark,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `1.5pt solid ${C.black}`,
  },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.black },
  date: { fontSize: 9, color: C.light },

  // Tabla
  table: { marginTop: 4 },

  // Familia header
  familyRow: {
    flexDirection: 'row',
    backgroundColor: C.indigoBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 0,
    borderTop: `1pt solid ${C.indigoBorder}`,
    borderBottom: `1pt solid ${C.indigoBorder}`,
  },
  familyLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Cabecera de columnas
  colHeader: {
    flexDirection: 'row',
    borderBottom: `0.5pt solid ${C.border}`,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  colHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Fila de datos
  dataRow: {
    flexDirection: 'row',
    borderBottom: `0.5pt solid ${C.borderLight}`,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  dataRowAlt: { backgroundColor: C.bgAlt },

  // Columnas
  colIndex:    { width: '4%' },
  colProduct:  { width: '30%' },
  colMaterial: { width: '10%' },
  colMeasures: { width: '14%' },
  colDesc:     { width: '30%' },
  colQty:      { width: '12%', alignItems: 'flex-end' },

  cellText:    { fontSize: 9, color: C.dark },
  cellMuted:   { fontSize: 8, color: C.light },
  cellIndex:   { fontSize: 8, color: C.muted },
  cellProduct: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.black },
  cellQty:     { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.black, textAlign: 'right' },
  cellQtyUnit: { fontSize: 7, color: C.muted, textAlign: 'right' },

  // Sub-fila de fotos
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingLeft: '4%',
    paddingBottom: 6,
    borderBottom: `0.5pt solid ${C.borderLight}`,
    backgroundColor: '#ffffff',
  },
  photo: { width: 64, height: 64, objectFit: 'cover' },

  // Notas
  notes: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.bgAlt,
    border: `0.5pt solid ${C.border}`,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  notesText: { fontSize: 9, color: C.mid },
})

export type PdfItem = {
  id: string
  family: string | null
  product_name: string
  material: string | null
  measurements: string | null
  weight: string | null
  description: string | null
  quantity: number
  photos: { url: string; blobUrl: string }[]
}

export type PdfOrder = {
  id: string
  created_at: string
  notes: string | null
  items: PdfItem[]
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(dateStr))
}

function ColHeaders() {
  return (
    <View style={styles.colHeader}>
      <View style={styles.colIndex}><Text style={styles.colHeaderText}>#</Text></View>
      <View style={styles.colProduct}><Text style={styles.colHeaderText}>Producto</Text></View>
      <View style={styles.colMaterial}><Text style={styles.colHeaderText}>Material</Text></View>
      <View style={styles.colMeasures}><Text style={styles.colHeaderText}>Medidas / Peso</Text></View>
      <View style={styles.colDesc}><Text style={styles.colHeaderText}>Descripción</Text></View>
      <View style={styles.colQty}><Text style={styles.colHeaderText}>Cant.</Text></View>
    </View>
  )
}

export function OrderDocument({ order }: { order: PdfOrder }) {
  const families: string[] = []
  order.items.forEach(item => {
    const f = item.family || ''
    if (!families.includes(f)) families.push(f)
  })

  let globalIndex = 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pedido</Text>
          <Text style={styles.date}>{formatDate(order.created_at)}</Text>
        </View>

        <View style={styles.table}>
          {families.map((family, fi) => {
            const familyItems = order.items.filter(i => (i.family || '') === family)
            return (
              <View key={family}>
                {/* Familia header */}
                {family !== '' && (
                  <View style={styles.familyRow}>
                    <Text style={styles.familyLabel}>{family}</Text>
                  </View>
                )}

                {/* Col headers en la primera familia o cuando no hay familia */}
                {(fi === 0 || family === '') && <ColHeaders />}
                {fi > 0 && family !== '' && <ColHeaders />}

                {familyItems.map((item, itemIdx) => {
                  globalIndex++
                  const isAlt = itemIdx % 2 === 1
                  const measParts = [item.measurements, item.weight].filter(Boolean).join(' · ')
                  const hasPhotos = item.photos.filter(p => p.blobUrl).length > 0

                  return (
                    <View key={item.id}>
                      <View style={[styles.dataRow, ...(isAlt ? [styles.dataRowAlt] : [])]}>
                        <View style={styles.colIndex}>
                          <Text style={styles.cellIndex}>{globalIndex}</Text>
                        </View>
                        <View style={styles.colProduct}>
                          <Text style={styles.cellProduct}>{item.product_name}</Text>
                        </View>
                        <View style={styles.colMaterial}>
                          <Text style={styles.cellText}>{item.material || ''}</Text>
                        </View>
                        <View style={styles.colMeasures}>
                          <Text style={styles.cellText}>{measParts}</Text>
                        </View>
                        <View style={styles.colDesc}>
                          <Text style={styles.cellMuted}>{item.description || ''}</Text>
                        </View>
                        <View style={styles.colQty}>
                          <Text style={styles.cellQty}>{item.quantity}</Text>
                          <Text style={styles.cellQtyUnit}>ud.</Text>
                        </View>
                      </View>

                      {hasPhotos && (
                        <View style={[styles.photoRow, ...(isAlt ? [styles.dataRowAlt] : [])]}>
                          {item.photos.filter(p => p.blobUrl).map((photo, i) => (
                            <Image key={i} src={photo.blobUrl} style={styles.photo} />
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>

        {order.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Nota general</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
