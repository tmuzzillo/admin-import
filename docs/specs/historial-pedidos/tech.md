# Spec técnico — Historial de pedidos

## Ruta

`/pedidos` → `app/(autenticado)/pedidos/page.tsx`

Server Component — fetch directo desde Supabase, sin estado client-side.

## Fetch de datos

```ts
const supabase = createServerClient(...)
const { data: orders } = await supabase
  .from('orders')
  .select('id, created_at, order_items(count)')
  .order('created_at', { ascending: false })
```

La agregación `order_items(count)` trae la cantidad de ítems por pedido sin traer los ítems completos.

## Estructura de la pantalla

```tsx
export default async function PedidosPage() {
  // fetch orders
  return (
    <div>
      <h1>Pedidos</h1>
      <Link href="/pedidos/nuevo"><Button>Nuevo pedido</Button></Link>
      {orders.length === 0 ? <EmptyState /> : <OrdersTable orders={orders} />}
    </div>
  )
}
```

## Componentes

```
app/(autenticado)/pedidos/_components/
  OrdersTable.tsx   # Tabla de pedidos (Server Component)
  EmptyState.tsx    # Mensaje vacío con link a /pedidos/nuevo
```

`OrdersTable` renderiza filas con:
- Fecha formateada (ej: "10 de mayo de 2026")
- "X productos"
- `<Link href="/pedidos/[id]/preview">Ver</Link>`

## Formato de fecha

Usar `Intl.DateTimeFormat` nativo (sin dependencias extra):

```ts
new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(order.created_at))
```

## Estado vacío

Cuando no hay pedidos: mensaje "Todavía no hay pedidos" + botón "Crear el primero" → `/pedidos/nuevo`.
