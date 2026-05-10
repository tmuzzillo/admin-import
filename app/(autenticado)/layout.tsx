import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './_components/LogoutButton'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-semibold text-zinc-900">Admin Import</span>
            <nav className="flex items-center gap-1">
              <Link
                href="/pedidos"
                className="px-3 py-1.5 text-sm rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Pedidos
              </Link>
              <Link
                href="/pedidos/nuevo"
                className="px-3 py-1.5 text-sm rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Nuevo pedido
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
