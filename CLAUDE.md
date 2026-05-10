# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto del proyecto

**Admin Import** es un gestor de pedidos a proveedores de importación. El usuario final es una persona mayor, no técnica. Necesita una interfaz simple para armar pedidos, pasarlos por un flujo de aprobación con su socio, y enviarlos al proveedor en PDF.

**Problema que resuelve:** reemplazar una Google Sheet difícil de editar y entender.

## Estado actual

- Repo creado, Next.js scaffoldeado. **Aún sin dependencias adicionales instaladas ni código de negocio escrito.**
- Dependencias pendientes de instalar: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn/ui`, librería de PDF (por definir).

## Stack decidido

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (DB + Auth + Storage para imágenes)
- shadcn/ui (style: new-york)
- PDF: por definir (react-pdf o puppeteer)
- Hosting: Vercel (free)

## Contexto del negocio

Importación de productos descartables (vasos, platos, cubiertos, bowls, bolsas) desde China. Etapa de **descubrimiento**: primer pedido, productos inestables — pueden cambiar de nombre, no estar disponibles, o no repetirse. Por eso no hay catálogo fijo todavía.

## DB Schema (diseñado, no implementado)

```sql
-- Pedidos
orders: id, status (draft | sent_to_partner | approved | sent_to_supplier), notes, created_at

-- Ítems de cada pedido (productos libres, sin catálogo)
order_items: id, order_id, family, product_name, material, measurements, weight, description, quantity, sort_order, created_at

-- Fotos por ítem (N fotos por producto)
order_item_photos: id, order_item_id, url, filename, sort_order, created_at
```

> Sin tabla `products` por ahora — los productos se tipean a mano en cada pedido.  
> Cuando el catálogo se estabilice: agregar `products` + FK opcional en `order_items`.  
> Sin montos ni precios todavía.  
> Un solo proveedor. Para escalar: agregar tabla `suppliers` + FK en `orders`.

## Pantallas MVP

| Ruta | Descripción |
|------|-------------|
| `/login` | Pantalla de acceso |
| `/pedidos` | Historial de pedidos |
| `/pedidos/nuevo` | Formulario libre: filas con familia, producto, material, medidas, peso, descripción, fotos, cantidad |
| `/pedidos/[id]/preview` | Vista previa + descarga PDF |

## Workflow de un pedido

```
Borrador → Enviado al socio → Aprobado → Enviado al proveedor
```
> El flujo de estados se implementa en Etapa 2. El MVP solo crea y descarga.

## Decisiones de diseño

| Tema | Decisión |
|------|----------|
| Catálogo | Sin catálogo en MVP. Productos se tipean a mano (negocio en etapa de descubrimiento) |
| Reutilización | "Copiar pedido anterior" duplica ítems + fotos de un pedido existente. Evita re-tipear |
| Fotos | Múltiples por ítem. Upload por file picker o paste desde portapapeles (Ctrl+V). URLs reutilizadas al copiar pedido |
| PDF | Incluye todos los campos del ítem + fotos. Sin montos ni precios |
| "Enviar al socio" | El usuario descarga el PDF y lo envía manualmente. La app no manda emails |
| Acceso | Login con Supabase Auth. Backoffice de uso interno |

## Roadmap

### Etapa 1 — MVP (actual)
Reemplazar la Google Sheet. El usuario puede armar un pedido desde cero, subir fotos, y descargar un PDF para enviar al proveedor.
- Infra base (Supabase, Auth, layout)
- Crear pedido (formulario libre con todos los campos de la sheet + fotos)
- "Copiar pedido anterior"
- Preview + descarga PDF
- Historial de pedidos

### Etapa 2 — Flujo de aprobación
Dar visibilidad del estado del pedido a ambos socios.
- Workflow de estados: `draft → sent_to_partner → approved → sent_to_supplier`
- Acciones por estado en la pantalla de detalle
- Vista del socio para aprobar/rechazar

### Etapa 3 — Catálogo de productos
Cuando el catálogo se estabilice, evitar re-tipear en cada pedido.
- Tabla `products` con todos los campos
- "Guardar como producto" desde un ítem de pedido
- Autocompletar al crear pedido desde el catálogo
- Pantalla `/productos` para CRUD del catálogo

### Etapa 4 — Control de stock
Cerrar el loop: saber qué se pidió, qué llegó y qué hay disponible.
- Registrar recepción de pedidos
- Stock actual por producto
- Alertas de stock bajo

### Etapa 5 — Multi-proveedor y montos
- Tabla `suppliers` + FK en `orders`
- Precios por ítem y totales en PDF
- Comparación de cotizaciones entre proveedores

## Fuera de scope (por ahora)

- Catálogo de productos
- Flujo de estados y aprobación
- Seguimiento de recepción y stock
- Multi-proveedor
- Envío de emails desde la app
- Montos y precios en PDF

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack by default in Next.js 16)
npm run build    # Production build (Turbopack by default)
npm run start    # Start production server
npm run lint     # Run ESLint via CLI (NOT `next lint` — removed in v16)
```

> No test runner is configured yet. Add one before writing tests.

## Stack

- **Next.js 16.2.4** with App Router (not Pages Router)
- **React 19.2.4** — Server Components by default
- **TypeScript 5** — strict mode enabled
- **Tailwind CSS v4** — configured via `postcss.config.mjs`
- Path alias: `@/*` → `./` (repo root)

## Next.js 16 — Key Breaking Changes

This project uses **Next.js 16**, which differs significantly from v13–15:

| Area | Change |
|---|---|
| Bundler | Turbopack is default for `dev` and `build`; custom `webpack` configs will break `next build` |
| Linting | `next lint` removed; use `eslint` CLI directly (`npm run lint`) |
| Build | `next build` no longer runs linting automatically |
| Config | `serverRuntimeConfig` / `publicRuntimeConfig` removed; use `process.env` + `NEXT_PUBLIC_` prefix |
| Routing | `middleware` convention deprecated; use `proxy.ts` instead |
| Node.js | Minimum Node.js 20.9 required |

## App Router Conventions

- **Server Components by default** — add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs.
- Route files under `app/`: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` (API).
- Route groups `(group)/` organize code without affecting URLs.
- Private folders `_folder/` colocate non-routable utilities next to routes.
- Dynamic params: `[segment]`, catch-all: `[...segment]`, optional: `[[...segment]]`.
- `params` prop is a **Promise** in v16 — always `await params` before accessing values.

## Navigation

- Use `<Link>` from `next/link` for client-side navigation (auto-prefetches on viewport entry).
- For instant client-side transitions on dynamic routes: export `unstable_instant` from the route **and** wrap with `<Suspense>`.

## Environment Variables

- Server-only: access `process.env.VAR` directly inside Server Components or Route Handlers.
- Client-accessible: prefix with `NEXT_PUBLIC_` in `.env.local`.
- Runtime (not bundled at build): call `await connection()` from `next/server` before reading `process.env`.
