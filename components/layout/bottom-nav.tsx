'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Plus, MessageCircle } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: TrendingUp,
      active: pathname === '/dashboard',
    },
    {
      href: '/add-transaction',
      label: 'Catat',
      icon: Plus,
      active: pathname === '/add-transaction',
    },
    {
      href: '/chat',
      label: 'Chat',
      icon: MessageCircle,
      active: pathname === '/chat',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-4 text-xs font-medium transition-colors ${
                item.active
                  ? 'text-emerald-600 border-t-2 border-emerald-600 -mt-px'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
