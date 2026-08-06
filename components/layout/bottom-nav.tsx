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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] bg-slate-100/90 backdrop-blur-md border border-slate-200/50 rounded-full p-2.5 shadow-xl flex items-center justify-between gap-3 z-50 md:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Left Inner Tab Bar Capsule */}
      <div className="flex-1 flex items-center justify-around bg-white/40 border border-slate-200/30 rounded-full px-2 py-1.5 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center justify-center gap-1.5 transition-all duration-300 select-none ${
                tab.active
                  ? 'bg-[#E5EEFF] text-[#1E56EA] rounded-full px-4 py-2 text-[10px] font-extrabold shadow-sm scale-105'
                  : 'text-slate-500 hover:text-slate-900 rounded-full px-2.5 py-2 text-[10px] font-bold'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
              {tab.active && <span>{tab.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Right Standalone Circle Settings Button */}
      <Link
        href="/settings"
        className={`w-11 h-11 rounded-full border shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 ${
          isSettingsActive
            ? 'bg-[#E5EEFF] border-slate-200/30 text-[#1E56EA]'
            : 'bg-white border-slate-200/60 text-slate-600 hover:text-slate-900'
        }`}
        title="Pengaturan"
      >
        <Settings className="w-5 h-5 stroke-[2.2]" />
      </Link>
    </nav>
  )
}
