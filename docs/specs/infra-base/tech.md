# Spec técnico — Infra base

## Dependencias a instalar

```bash
npm install @supabase/supabase-js @supabase/ssr
npx shadcn@latest init   # style: new-york, color: zinc
```

## Variables de entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Schema SQL (Supabase)

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  family text,
  product_name text not null,
  material text,
  measurements text,
  weight text,
  description text,
  quantity integer not null check (quantity > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table order_item_photos (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  url text not null,
  filename text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
```

RLS: habilitar en las tres tablas. Política inicial: acceso total a usuarios autenticados.

```sql
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_photos enable row level security;

create policy "authenticated full access" on orders
  for all using (auth.role() = 'authenticated');

create policy "authenticated full access" on order_items
  for all using (auth.role() = 'authenticated');

create policy "authenticated full access" on order_item_photos
  for all using (auth.role() = 'authenticated');
```

## Supabase Storage

Crear bucket `order-photos` (público para simplificar la lectura en PDF client-side).

```
order-photos/
  {order_id}/
    {item_id}/
      {filename}
```

## Clientes Supabase (patrón SSR con @supabase/ssr)

```
lib/supabase/
  server.ts   # createServerClient() — para Server Components y Route Handlers
  client.ts   # createBrowserClient() — para Client Components
```

`server.ts` usa cookies de Next.js (`cookies()` de `next/headers`).

## Protección de rutas

Usar `proxy.ts` en la raíz del proyecto (reemplaza al `middleware` deprecado en v16):

```ts
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // Refrescar sesión + redirigir a /login si no hay sesión activa
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
}
```

## Estructura de archivos

```
app/
  login/
    page.tsx          # Pantalla de login (Client Component)
  (autenticado)/
    layout.tsx        # Layout con navegación lateral + botón logout
    pedidos/
      page.tsx
      nuevo/
        page.tsx
      [id]/
        preview/
          page.tsx
```

El route group `(autenticado)` agrupa todas las rutas protegidas bajo un layout compartido sin afectar las URLs.

## Componente de layout autenticado

`app/(autenticado)/layout.tsx` — Server Component que verifica sesión. Renderiza:
- `<nav>` con links a `/pedidos` y `/pedidos/nuevo`
- Botón logout (Client Component separado que llama a `supabase.auth.signOut()`)
- `{children}`

## Pantalla de login

`app/login/page.tsx` — Client Component (`'use client'`).
- Usa `createBrowserClient` de `lib/supabase/client.ts`
- Llama a `supabase.auth.signInWithPassword()`
- En éxito: `router.push('/pedidos')`
- En error: muestra mensaje inline
- Componentes shadcn/ui: `<Input>`, `<Button>`, `<Label>`
