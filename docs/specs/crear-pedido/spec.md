# Spec funcional — Crear pedido

## Objetivo

Permitir al usuario armar un pedido agregando productos a mano con todos sus atributos y fotos, o copiando un pedido anterior como punto de partida.

## Flujo principal — pedido nuevo

1. El usuario navega a "Nuevo pedido".
2. Ve un formulario vacío con una fila inicial.
3. Por cada producto que quiere pedir, completa:
   - **Familia** (texto libre, ej: "VASOS", "BOWLS", "VARIOS")
   - **Nombre del producto** (requerido)
   - **Material** (ej: KRAFT, PET)
   - **Medidas** (ej: 350ml, ovaladas)
   - **Gramaje/Peso** (ej: 950cc)
   - **Descripción** (ej: "Doble pared", "base negra, tapa transparente")
   - **Cantidad** (número entero positivo, requerido)
   - **Fotos** (opcional, múltiples)
4. Puede agregar más filas con "Agregar producto".
5. Puede eliminar cualquier fila.
6. Puede agregar una nota general al pedido.
7. Presiona "Guardar pedido" → va al preview.

## Flujo alternativo — copiar pedido anterior

1. En la pantalla de nuevo pedido, el usuario presiona "Copiar pedido anterior".
2. Ve un listado de sus pedidos anteriores (fecha + cantidad de ítems).
3. Selecciona uno.
4. El formulario se puebla con todos los ítems y fotos de ese pedido.
5. El usuario ajusta cantidades, agrega o elimina filas, y guarda.

> Las fotos al copiar reutilizan las URLs existentes en Supabase Storage. No hay re-upload.

## Pantalla `/pedidos/nuevo`

- Título: "Nuevo pedido"
- Botón secundario: "Copiar pedido anterior"
- Lista de filas. Cada fila expande los campos:
  - Familia (input texto, ancho corto)
  - Nombre del producto (input texto, campo principal — más ancho)
  - Material (input texto)
  - Medidas (input texto)
  - Gramaje/Peso (input texto)
  - Descripción (input texto o textarea corto)
  - Cantidad (input numérico)
  - Zona de fotos: thumbnails de las fotos subidas + botón subir + soporte paste
  - Botón eliminar fila (ícono papelera)
- Botón "Agregar producto"
- Textarea: nota general del pedido (opcional)
- Botón "Guardar pedido"

## Upload de fotos

- **File picker**: botón "Subir foto" abre el explorador de archivos. Acepta imágenes (jpg, png, webp).
- **Paste**: el usuario hace Ctrl+V / Cmd+V con la imagen en el portapapeles y se sube automáticamente.
- Las fotos subidas se muestran como thumbnails con botón para eliminar cada una.
- No hay límite fijo de fotos por ítem, pero se asume máximo 3-4 en la práctica.

## Reglas de negocio

- Campos requeridos por ítem: nombre del producto y cantidad (≥ 1).
- Todos los demás campos son opcionales.
- No se puede guardar sin al menos un ítem.
- El pedido se guarda con estado `draft`.
- Las fotos se suben a Supabase Storage al momento de seleccionarlas (antes del guardado del pedido), no al presionar "Guardar". Esto evita pérdida de trabajo si el usuario tarda.
