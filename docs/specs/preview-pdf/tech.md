# Spec técnico — Preview y descarga de PDF

## Ruta

`/pedidos/[id]/preview` → `app/(autenticado)/pedidos/[id]/preview/page.tsx`

## Estrategia de rendering

- `page.tsx`: Server Component. Fetch del pedido completo (ítems + fotos) desde Supabase.
- `<PdfDownloadButton>`: Client Component. Recibe los datos del pedido como props y genera el PDF en el browser.

```tsx
// page.tsx
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient(...)
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_photos(*))')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'order_items' })
    .single()

  if (!order) notFound()

  return (
    <>
      <OrderPreview order={order} />
      <PdfDownloadButton order={order} />
    </>
  )
}
```

## Librería PDF

**`@react-pdf/renderer`** — generación client-side, sin dependencias de servidor.

```bash
npm install @react-pdf/renderer
```

## Fotos en el PDF

`@react-pdf/renderer` soporta imágenes via `<Image src={url} />`. Las URLs de Supabase Storage son públicas → se cargan directamente.

Limitación: `@react-pdf/renderer` no puede hacer fetch de imágenes con CORS en algunos casos. Solución: usar `fetch(url).then(r => r.blob()).then(URL.createObjectURL)` para convertir a blob URL antes de pasarlas al documento.

```ts
// En PdfDownloadButton, antes de generar el PDF:
const itemsWithBlobPhotos = await Promise.all(
  order.order_items.map(async (item) => ({
    ...item,
    order_item_photos: await Promise.all(
      item.order_item_photos.map(async (photo) => ({
        ...photo,
        blobUrl: await fetchAsBlobUrl(photo.url),
      }))
    ),
  }))
)
```

## Estructura del documento PDF

```tsx
// OrderDocument.tsx
<Document>
  <Page size="A4" style={styles.page}>
    <Text style={styles.header}>Pedido — {formatDate(order.created_at)}</Text>

    {items.map(item => (
      <View key={item.id} style={styles.itemBlock}>
        <View style={styles.itemHeader}>
          <Text style={styles.productName}>{item.product_name}</Text>
          <Text style={styles.quantity}>Cantidad: {item.quantity}</Text>
        </View>
        <Text style={styles.meta}>
          {[item.family, item.material, item.measurements, item.weight].filter(Boolean).join(' | ')}
        </Text>
        {item.description && <Text style={styles.description}>{item.description}</Text>}
        {item.order_item_photos.length > 0 && (
          <View style={styles.photosGrid}>
            {item.order_item_photos.map(p => (
              <Image key={p.id} src={p.blobUrl} style={styles.photo} />
            ))}
          </View>
        )}
      </View>
    ))}

    {order.notes && <Text style={styles.generalNotes}>{order.notes}</Text>}
  </Page>
</Document>
```

Fotos: máximo 2 por fila, cada una con `width: '45%'`, separadas por `gap`.

## Componentes

```
app/(autenticado)/pedidos/[id]/preview/
  page.tsx
  _components/
    OrderPreview.tsx         # Vista HTML del pedido (Server Component)
    PdfDownloadButton.tsx    # Botón + generación PDF (Client Component)
    OrderDocument.tsx        # Definición del documento PDF
```

## Manejo de errores

- Pedido inexistente: `notFound()`
- Error al cargar foto para PDF: omitir esa foto silenciosamente (no bloquear la descarga)
