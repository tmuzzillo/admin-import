# Spec técnico — Rediseño UI

## 1. Tipografía — Inter

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Reemplazar Geist por inter.variable en <html>
```

Eliminar imports de Geist del layout.

---

## 2. Sidebar

### Archivos a modificar/crear

```
app/(autenticado)/
  layout.tsx                    # Cambiar de header horizontal a layout con sidebar
  _components/
    Sidebar.tsx                 # Componente sidebar (Server Component + NavLink client)
    NavLink.tsx                 # Link activo con usePathname ('use client')
    LogoutButton.tsx            # Sin cambios
```

### Layout

```tsx
// app/(autenticado)/layout.tsx
<div className="flex min-h-screen bg-zinc-50">
  <Sidebar />
  <main className="flex-1 min-w-0 px-8 py-8">
    {children}
  </main>
</div>
```

### Sidebar

```tsx
// _components/Sidebar.tsx
<aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-screen">
  {/* Logo */}
  <div className="px-5 py-5 border-b border-zinc-100">
    <span className="font-bold text-zinc-900 text-base">Admin Import</span>
  </div>
  {/* Nav */}
  <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
    <NavLink href="/pedidos" icon={<Package />}>Pedidos</NavLink>
    <NavLink href="/pedidos/nuevo" icon={<Plus />}>Nuevo pedido</NavLink>
  </nav>
  {/* Footer */}
  <div className="px-4 py-4 border-t border-zinc-100">
    <LogoutButton />
  </div>
</aside>
```

### NavLink

```tsx
'use client'
// Usa usePathname() para detectar ruta activa
// Activo: bg-indigo-50 text-indigo-700 font-medium
// Inactivo: text-zinc-600 hover:bg-zinc-100
```

---

## 3. Historial — desglose por familia

### Query actualizada

```ts
const { data: orders } = await supabase
  .from('orders')
  .select('id, created_at, order_items(family)')
  .order('created_at', { ascending: false })
```

### Agrupación en JS

```ts
function getFamilyCounts(items: { family: string | null }[]) {
  const counts: Record<string, number> = {}
  items.forEach(({ family }) => {
    const key = family || 'Sin familia'
    counts[key] = (counts[key] ?? 0) + 1
  })
  // Ordenar por count desc, 'Sin familia' al final
  return Object.entries(counts).sort((a, b) => {
    if (a[0] === 'Sin familia') return 1
    if (b[0] === 'Sin familia') return -1
    return b[1] - a[1]
  })
}
```

### Display

Badges inline: `VASOS ×5`, `BOWLS ×3` — mismo estilo indigo que los badges del formulario.

---

## 4. Formulario — jerarquía visual + botón fijo

### OrderItemCard — campos primarios vs secundarios

```tsx
{/* Primarios — altura h-10, texto base */}
<div className="grid grid-cols-4 gap-3">
  <div className="col-span-3">
    <Label className="...">Producto *</Label>
    <Input className="h-10 text-base font-semibold" />
  </div>
  <div>
    <Label className="...">Cantidad *</Label>
    <Input className="h-10 text-lg font-bold" />
  </div>
</div>

{/* Secundarios — altura h-8, texto sm, agrupados */}
<div className="grid grid-cols-5 gap-2 mt-1">
  <ComboboxField />  {/* Familia */}
  <ComboboxField />  {/* Material */}
  <Input className="h-8 text-sm" />  {/* Medidas */}
  <Input className="h-8 text-sm" />  {/* Peso */}
  <Input className="h-8 text-sm" />  {/* Descripción — col-span-2 si es necesario */}
</div>
```

### Botón fijo — nuevo componente

```tsx
// app/(autenticado)/pedidos/nuevo/_components/StickyFooter.tsx
'use client'
// Recibe items[], muestra contador y botón
// position: fixed bottom-0, left: sidebar width (14rem)
// bg-white border-t border-zinc-200 px-6 py-3
// flex justify-between items-center
```

El componente necesita el `saving` state y el handler `onSave`. Se mueve el botón del `page.tsx` al `StickyFooter`.

---

## 5. PDF — formato factura

### Cambios en `OrderDocument.tsx`

Reemplazar el layout actual por una tabla con:

```
| #  | PRODUCTO              | MATERIAL | MEDIDAS/PESO | DESCRIPCIÓN | CANT. |
|----|----------------------|----------|--------------|-------------|-------|
| 1  | Vasos papel 12 oz     | KRAFT    | 350ml        | Doble pared |   500 |
```

**Estilos tabla:**
```ts
tableContainer: { marginTop: 8 },
tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#e0e7ff',  // indigo-100
  borderBottom: '1pt solid #c7d2fe',
  paddingVertical: 5, paddingHorizontal: 6,
},
tableRow: {
  flexDirection: 'row',
  borderBottom: '0.5pt solid #f4f4f5',
  paddingVertical: 6, paddingHorizontal: 6,
},
tableRowAlt: { backgroundColor: '#fafafa' },
colIndex:    { width: '6%' },
colProduct:  { width: '28%' },
colMaterial: { width: '10%' },
colMeasures: { width: '13%' },
colDesc:     { width: '25%' },
colQty:      { width: '10%', textAlign: 'right' },
```

**Fotos por ítem:**
```tsx
// Sub-fila después de la fila del ítem, solo si tiene fotos
<View style={styles.photoRow}>
  {item.photos.map(p => <Image src={p.blobUrl} style={styles.photoThumb} />)}
</View>
```

**Columnas de ancho:**
- `#`: 5%
- Producto: 28%
- Material: 10%
- Medidas/Peso: 13%
- Descripción: 28%
- Cantidad: alineada a la derecha, 16%

---

## Orden de implementación

1. Font (Inter) — 5 min
2. Sidebar — reemplaza layout autenticado
3. Historial con familia counts
4. OrderItemCard — jerarquía primario/secundario
5. StickyFooter — botón fijo
6. PDF — rewrite OrderDocument
