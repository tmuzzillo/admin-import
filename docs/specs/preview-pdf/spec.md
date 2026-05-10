# Spec funcional — Preview y descarga de PDF

## Objetivo

Mostrar un resumen limpio del pedido con todos sus campos y fotos, y permitir descargarlo como PDF para enviar al proveedor.

## Flujo de usuario

1. El usuario llega a esta pantalla tras guardar un pedido, o desde el historial.
2. Ve el pedido organizado por ítem: nombre, familia, material, medidas, peso, descripción, cantidad y fotos.
3. Si el pedido tiene una nota general, se muestra al final.
4. Presiona "Descargar PDF" → el archivo se descarga directamente.
5. Puede volver al historial desde esta pantalla.

## Pantalla `/pedidos/[id]/preview`

- Título: "Pedido" + fecha de creación
- Lista de ítems, cada uno mostrando:
  - Nombre del producto (destacado)
  - Familia, material, medidas, peso (en secundario)
  - Descripción
  - Cantidad
  - Fotos (thumbnails en fila)
- Nota general del pedido al final (si existe)
- Botón "Descargar PDF"
- Link "Volver a pedidos"

## Contenido del PDF

- Encabezado: "Pedido — [fecha]"
- Por cada ítem:
  - Nombre del producto + cantidad (destacados)
  - Familia | Material | Medidas | Peso
  - Descripción
  - Fotos en grilla (máximo 2 por fila para que sean legibles)
- Nota general al pie (si existe)
- Sin montos ni precios

## Reglas de negocio

- El PDF se genera en el browser (client-side), sin pasar por el servidor.
- El nombre del archivo: `pedido-[fecha].pdf`
- La pantalla de preview refleja fielmente lo que tendrá el PDF.
- Si un ítem no tiene fotos, se omite la sección de fotos de ese ítem en el PDF.
