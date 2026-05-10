# Spec técnico — Crear pedido

## Ruta

`/pedidos/nuevo` → `app/(autenticado)/pedidos/nuevo/page.tsx`

Client Component (`'use client'`) — formulario completamente dinámico.

## Dependencia extra

```bash
npm install @hello-pangea/dnd   # drag-and-drop para reordenar filas (opcional, etapa 2)
```

Por ahora sin reordenamiento. Las filas se agregan al final.

## Tipos

```ts
type PhotoDraft = {
  localId: string        // crypto.randomUUID() — id local antes de subir
  url: string            // URL de Supabase Storage (disponible post-upload)
  filename: string
  uploading: boolean
  error?: string
}

type OrderItemDraft = {
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
```

## Estado del formulario

```ts
const [items, setItems] = useState<OrderItemDraft[]>([emptyItem()])
const [generalNotes, setGeneralNotes] = useState('')
const [saving, setSaving] = useState(false)
const [errors, setErrors] = useState<Record<string, string>>({})
```

`emptyItem()` retorna un `OrderItemDraft` con todos los campos vacíos y `localId = crypto.randomUUID()`.

## Upload de fotos — flujo

Las fotos se suben a Supabase Storage **en el momento de selección**, no al guardar el pedido.

1. El usuario selecciona o pega una imagen.
2. Se agrega un `PhotoDraft` con `uploading: true` y se muestra un skeleton.
3. Se sube a `order-photos/temp/{localItemId}/{filename}` usando `supabase.storage.from('order-photos').upload(...)` desde el browser client.
4. Al completarse: `uploading: false`, `url = publicUrl`.
5. Al guardar el pedido, las fotos ya tienen URL — solo se insertan en `order_item_photos`.

> Las fotos en `temp/` son huérfanas si el usuario abandona el formulario. Limpiarlas es deuda técnica para etapa posterior.

## Paste desde portapapeles

```ts
// En cada fila, escuchar el evento paste del documento cuando la fila está activa
// o un área de drop por fila

function handlePaste(e: ClipboardEvent, itemLocalId: string) {
  const file = Array.from(e.clipboardData?.items ?? [])
    .find(item => item.type.startsWith('image/'))
    ?.getAsFile()
  if (file) uploadPhoto(file, itemLocalId)
}
```

Alternativa más simple: un área `<div onPaste={...}>` por fila que captura el paste cuando el usuario hace foco en esa fila.

## "Copiar pedido anterior" — modal

Componente `<CopyOrderModal>`:
- Botón "Copiar pedido anterior" abre un `<Dialog>` de shadcn/ui.
- Dentro: lista de pedidos anteriores obtenida con `useEffect` + Supabase browser client (`orders` con `order_items(count)`, ordenados por `created_at DESC`).
- Al seleccionar uno: fetch de `order_items` + `order_item_photos` del pedido seleccionado.
- Poblar el estado `items` con los datos copiados (nuevos `localId`, mismas URLs de fotos).

```ts
async function copyOrder(orderId: string) {
  const { data } = await supabase
    .from('order_items')
    .select('*, order_item_photos(*)')
    .eq('order_id', orderId)
    .order('sort_order')

  setItems(data.map(item => ({
    localId: crypto.randomUUID(),
    ...pick(item, ['family', 'product_name', 'material', 'measurements', 'weight', 'description']),
    quantity: item.quantity,
    photos: item.order_item_photos.map(p => ({
      localId: crypto.randomUUID(),
      url: p.url,
      filename: p.filename ?? '',
      uploading: false,
    }))
  })))
}
```

## Guardado — Server Action

```ts
// app/(autenticado)/pedidos/nuevo/actions.ts
'use server'

export async function createOrder(
  items: Array<Omit<OrderItemDraft, 'localId' | 'photos'> & { photos: Array<{ url: string; filename: string }> }>,
  notes: string
): Promise<{ orderId: string }> {
  const supabase = createServerClient(...)

  // 1. Insertar en orders
  const { data: order } = await supabase.from('orders').insert({ notes }).select().single()

  // 2. Insertar order_items + order_item_photos en batch
  for (const [index, item] of items.entries()) {
    const { data: dbItem } = await supabase
      .from('order_items')
      .insert({ order_id: order.id, sort_order: index, ...omit(item, ['photos']) })
      .select().single()

    if (item.photos.length > 0) {
      await supabase.from('order_item_photos').insert(
        item.photos.map((p, i) => ({ order_item_id: dbItem.id, url: p.url, filename: p.filename, sort_order: i }))
      )
    }
  }

  return { orderId: order.id }
}
```

Tras éxito en el cliente: `router.push(\`/pedidos/${orderId}/preview\`)`.

## Componentes UI

```
app/(autenticado)/pedidos/nuevo/
  page.tsx                    # Client Component principal
  actions.ts                  # Server Action: createOrder
  _components/
    OrderItemRow.tsx           # Una fila del formulario (todos los campos + fotos)
    PhotoUploadZone.tsx        # Zona de upload/paste por ítem
    PhotoThumbnail.tsx         # Thumbnail con botón eliminar
    CopyOrderModal.tsx         # Dialog para copiar pedido anterior
```

Componentes shadcn/ui utilizados: `<Input>`, `<Textarea>`, `<Button>`, `<Dialog>`, `<Label>`.

## Validación

Solo al intentar guardar:
- `items.length > 0`
- Por cada ítem: `product_name !== ''` y `quantity >= 1`

Errores con `errors[localId + '.product_name']` y `errors[localId + '.quantity']`.
