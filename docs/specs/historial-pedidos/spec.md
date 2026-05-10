# Spec funcional — Historial de pedidos

## Objetivo

Darle al usuario un lugar donde ver todos sus pedidos guardados, con acceso rápido al preview y descarga.

## Flujo de usuario

1. El usuario navega a "Pedidos".
2. Ve una lista de todos sus pedidos ordenados del más reciente al más antiguo.
3. Cada pedido muestra: fecha de creación y cantidad de ítems.
4. Al hacer click en un pedido, va a la pantalla de preview (`/pedidos/[id]/preview`).

## Pantalla `/pedidos`

- Título: "Pedidos"
- Lista/tabla de pedidos con:
  - Fecha de creación
  - Cantidad de productos en el pedido
  - Botón/link "Ver" que lleva al preview
- Si no hay pedidos: mensaje vacío con link a "Nuevo pedido"

## Reglas de negocio

- Se muestran todos los pedidos del usuario autenticado.
- Orden: más reciente primero.
- No hay paginación en el MVP (se asume volumen bajo).
