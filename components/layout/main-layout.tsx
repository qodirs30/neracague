'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BottomNav } from './bottom-nav'
import { TrendingUp, Plus, MessageCircle, Settings, Search, Bell } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
      label: 'Catat Transaksi',
      icon: Plus,
      active: pathname === '/add-transaction',
    },
    {
      href: '/chat',
      label: 'Chat Asisten AI',
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
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col md:flex-row">
      {/* Left Sidebar (Desktop only) */}
      <div className="hidden md:flex flex-col items-center py-8 w-24 bg-white border-r border-slate-100 flex-shrink-0 sticky top-0 h-screen z-50">
        {/* Logo/Brand */}
        <Link href="/dashboard" className="mb-12 hover:scale-105 transition-transform duration-200">
          <Image
            src="/logo.png"
            alt="neracague Logo"
            width={36}
            height={36}
            className="w-10 h-10 object-contain rounded-xl shadow-sm border border-slate-100/50"
            priority
          />
        </Link>
        
        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-6 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-300 relative group ${
                  item.active 
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/30' 
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
                
                {/* Custom Tooltip */}
                <div className="absolute left-20 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
        
        {/* Footer / User avatar */}
        <div className="mt-auto">
          <Link href="/settings">
            <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden hover:opacity-85 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm">
              <Image 
                src="/placeholder-user.jpg" 
                alt="User" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Desktop only) */}
        <div className="hidden md:flex items-center justify-between px-10 py-6 bg-white border-b border-slate-100/50 flex-shrink-0">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Hi, Sobat Neracague</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Berikut adalah ringkasan aktivitas keuangan pribadi Anda.</p>
          </div>
          
          {/* Header Right Actions */}
          <div className="flex items-center gap-4">
            {/* Mock Search & Notification */}
            <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-250 cursor-pointer border border-transparent hover:border-slate-100/50">
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>
            <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-250 cursor-pointer relative border border-transparent hover:border-slate-100/50">
              <Bell className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile layout gets standard padding and bottom nav spacing */}
          <div className="p-4 md:p-10 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  )
}
