import { Package, Plus } from 'lucide-react'
import { NavLink } from './NavLink'
import { LogoutButton } from './LogoutButton'

export function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-100">
        <span className="font-bold text-zinc-900 text-base tracking-tight">Admin Import</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <NavLink href="/pedidos" icon={<Package className="w-4 h-4" />}>
          Pedidos
        </NavLink>
        <NavLink href="/pedidos/nuevo" icon={<Plus className="w-4 h-4" />}>
          Nuevo pedido
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-100">
        <LogoutButton />
      </div>
    </aside>
  )
}
