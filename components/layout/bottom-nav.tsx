'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Plus, MessageCircle, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
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

  const isSettingsActive = pathname === '/settings'

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] bg-white/30 backdrop-blur-xl border border-white/40 rounded-full p-2 shadow-[0_8px_32px_0_rgba(15,23,42,0.06)] flex items-center justify-between gap-3.5 z-50 md:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Left Inner Tab Bar Capsule (Liquid glass sub-capsule) */}
      <div className="flex-1 flex items-center justify-around bg-white/20 border border-white/20 rounded-full px-2 py-1.5 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center justify-center gap-1.5 transition-all duration-300 select-none ${
                tab.active
                  ? 'bg-white/60 text-[#1E56EA] border border-white/50 rounded-full px-3.5 py-1.8 text-[10px] font-extrabold shadow-[0_4px_12px_rgba(30,86,234,0.05)] scale-105'
                  : 'text-slate-650 text-slate-700 hover:text-slate-900 rounded-full px-2 py-1.5 text-[10px] font-bold'
              }`}
            >
              <Icon className="w-3.8 h-3.8 flex-shrink-0 stroke-[2.6]" />
              {tab.active && <span>{tab.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Right Standalone Circle Settings Button (Liquid glass circle) */}
      <Link
        href="/settings"
        className={`w-10.5 h-10.5 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 ${
          isSettingsActive
            ? 'bg-white/60 border border-white/50 text-[#1E56EA] shadow-[0_4px_12px_rgba(30,86,234,0.05)]'
            : 'bg-white/20 border border-white/20 text-slate-700 hover:text-slate-900 shadow-sm'
        }`}
        title="Pengaturan"
        style={{ width: '42px', height: '42px' }}
      >
        <Settings className="w-4.5 h-4.5 stroke-[2.4]" />
      </Link>
    </nav>
  )
}
