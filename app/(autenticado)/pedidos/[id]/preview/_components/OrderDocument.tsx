'use client'

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#18181b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottom: '1pt solid #e4e4e7',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#71717a',
  },
  familyHeader: {
    backgroundColor: '#eef2ff',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 16,
    marginBottom: 8,
  },
  familyLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  itemBlock: {
    borderBottom: '0.5pt solid #f4f4f5',
    paddingVertical: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  productName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    flex: 1,
    marginRight: 12,
  },
  quantity: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#3f3f46',
  },
  quantityLabel: {
    fontSize: 9,
    color: '#a1a1aa',
  },
  meta: {
    fontSize: 9,
    color: '#71717a',
    marginBottom: 2,
  },
  description: {
    fontSize: 9,
    color: '#52525b',
    marginTop: 2,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  photo: {
    width: 90,
    height: 90,
    objectFit: 'cover',
    borderRadius: 4,
    border: '0.5pt solid #e4e4e7',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    border: '0.5pt solid #e4e4e7',
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: '#3f3f46',
  },
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

export function OrderDocument({ order }: { order: PdfOrder }) {
  // Group items by family preserving order
  const families: string[] = []
  order.items.forEach(item => {
    const f = item.family || ''
    if (!families.includes(f)) families.push(f)
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pedido</Text>
          <Text style={styles.date}>{formatDate(order.created_at)}</Text>
        </View>

        {/* Items grouped by family */}
        {families.map(family => {
          const familyItems = order.items.filter(i => (i.family || '') === family)
          return (
            <View key={family}>
              {family !== '' && (
                <View style={styles.familyHeader}>
                  <Text style={styles.familyLabel}>{family}</Text>
                </View>
              )}
              {familyItems.map(item => {
                const metaParts = [item.material, item.measurements, item.weight].filter(Boolean)
                return (
                  <View key={item.id} style={styles.itemBlock}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.productName}>{item.product_name}</Text>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <Text style={styles.quantityLabel}>ud.</Text>
                      </View>
                    </View>
                    {metaParts.length > 0 && (
                      <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
                    )}
                    {item.description && (
                      <Text style={styles.description}>{item.description}</Text>
                    )}
                    {item.photos.filter(p => p.blobUrl).length > 0 && (
                      <View style={styles.photosGrid}>
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

        {/* Nota general */}
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
