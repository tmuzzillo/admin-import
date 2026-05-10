# Spec funcional — Rediseño UI

## Objetivo

Mejorar la interfaz visual de toda la app: tipografía más legible, mejor uso del espacio, navegación lateral, y un PDF con formato de factura profesional.

## Principios

- Suave y redondeado, pero enfocado. Sin distracciones visuales.
- Toda la información necesaria siempre visible, nada oculto detrás de interacciones innecesarias.
- Optimizado para usuario no técnico, mayor.

---

## 1. Sistema de diseño global

### Tipografía
- Reemplazar Geist por **Inter** (Google Fonts vía `next/font`).
- Tamaños base más generosos para facilitar lectura.

### Color
- Fondo general: `zinc-50` (levemente gris, no blanco puro).
- Cards y paneles: `white`.
- Acento principal: `indigo-600` (botones primarios, badges, highlights).
- Texto principal: `zinc-900`. Secundario: `zinc-500`.

### Bordes y redondeo
- Inputs y cards: `rounded-xl`.
- Botones pequeños: `rounded-lg`. Botones grandes/primarios: `rounded-xl`.

---

## 2. Sidebar (reemplaza header horizontal)

**Estructura:**
- Sidebar fija a la izquierda, ancho ~220px.
- Top: logo / nombre "Admin Import" en bold.
- Centro: links de navegación con ícono + texto.
  - 📦 Pedidos → `/pedidos`
  - ➕ Nuevo pedido → `/pedidos/nuevo`
- Bottom: nombre del usuario + botón "Salir".
- El contenido ocupa el espacio restante a la derecha.

**Comportamiento:**
- Siempre visible (no colapsable por ahora, no hay mobile scope).
- Link activo resaltado con fondo indigo suave + texto indigo.

---

## 3. Historial de pedidos (`/pedidos`)

**Cards de pedido** — cada fila muestra:
- Fecha del pedido (grande, bold).
- Desglose por familia: badges con nombre de familia y cantidad de productos. Ej: `VASOS ×5` `BOWLS ×3` `VARIOS ×2`.
- Flecha o indicador de navegación a la derecha.

**Layout:**
- Lista de cards con separador sutil entre cada una.
- Alternancia blanco / zinc-50 (zebra).

---

## 4. Crear pedido (`/pedidos/nuevo`)

### Campos del ítem — jerarquía visual

**Primarios** (grandes, prominentes):
- Nombre del producto
- Cantidad

**Secundarios** (visibles pero más pequeños y suaves):
- Familia (combobox)
- Material (combobox)
- Medidas, Gramaje/Peso, Descripción (inputs compactos)

Los secundarios usan inputs de menor altura (`h-8`) con labels más pequeños. Se muestran en una grilla compacta debajo de los primarios.

### Botón "Guardar pedido" — fijo

- Barra sticky en el fondo del viewport.
- Izquierda: contador "X productos · X familias".
- Derecha: botón "Guardar pedido" (primario, grande).
- Fondo blanco con borde superior sutil para separarlo del contenido.

---

## 5. Preview del pedido (`/pedidos/[id]/preview`)

- Layout web libre (no simula hoja A4).
- Tabla limpia de productos agrupados por familia.
- Columnas visibles: Producto | Material · Medidas · Peso | Descripción | Cantidad.
- Fotos en fila debajo del nombre del producto (si tiene).
- Botón "Descargar PDF" prominente arriba a la derecha.

---

## 6. PDF — formato factura

### Estructura general
- Encabezado: título "Pedido" + fecha + línea separadora.
- Tabla principal por familia:
  - Header de familia (fondo indigo suave, texto bold uppercase).
  - Filas con fondo alternado (blanco / gris muy suave).
  - Columnas: **#** | **Producto** | **Material** | **Medidas / Peso** | **Descripción** | **Cantidad**
  - Última columna (Cantidad) alineada a la derecha, bold, grande.
- Nota general al pie (si existe).

### Fotos
- Si el ítem tiene fotos, aparecen debajo de su fila dentro de la tabla como una sub-fila de imágenes (thumbnails ~70x70).

### Tipografía
- Helvetica-Bold para headers y cantidades.
- Helvetica para el resto.
- Bordes finos en la tabla para darle formato de factura.
