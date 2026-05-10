# Spec funcional — Infra base

## Objetivo

Establecer la infraestructura mínima necesaria para que la app funcione: base de datos, autenticación y navegación.

## Flujos de usuario

### Login
- El usuario accede a la app y ve una pantalla de login (email + contraseña).
- Si las credenciales son correctas, es redirigido a `/pedidos`.
- Si son incorrectas, ve un mensaje de error.
- Mientras no esté autenticado, cualquier ruta protegida lo redirige a `/login`.

### Logout
- Desde cualquier pantalla, el usuario puede cerrar sesión.
- Al hacerlo es redirigido a `/login`.

## Pantallas

### `/login`
- Campo email
- Campo contraseña
- Botón "Ingresar"
- Mensaje de error si las credenciales fallan

### Layout autenticado
- Navegación lateral o superior con accesos a:
  - "Pedidos" → `/pedidos`
  - "Nuevo pedido" → `/pedidos/nuevo`
- Botón de logout visible

## Reglas de negocio

- La app es de uso interno (backoffice). No hay registro público de usuarios.
- Los usuarios son creados manualmente desde el dashboard de Supabase.
- Todas las rutas excepto `/login` requieren sesión activa.
