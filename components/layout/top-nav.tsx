'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TrendingUp, Plus, MessageCircle, Settings } from 'lucide-react'

export function TopNav() {
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
    {
      href: '/settings',
      label: 'Pengaturan',
      icon: Settings,
      active: pathname === '/settings',
    },
  ]

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="neracague Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-lg"
              priority
            />
            <span className="font-bold text-slate-900 hidden sm:inline">neracague</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </nav>
  )
}
