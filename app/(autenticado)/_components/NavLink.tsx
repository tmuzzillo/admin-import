'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Props = {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
}

export function NavLink({ href, children, icon }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/pedidos' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      )}
    >
      <span className={cn('flex-shrink-0', isActive ? 'text-indigo-500' : 'text-zinc-400')}>
        {icon}
      </span>
      {children}
    </Link>
  )
}
