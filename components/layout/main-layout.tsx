'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BottomNav } from './bottom-nav'
import { TrendingUp, Plus, MessageCircle, Settings, Search, Bell, X, CreditCard } from 'lucide-react'
import { getAllTransactions } from '@/lib/db/indexeddb'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [profileName, setProfileName] = useState('Sobat Neracague')
  
  // Search Overlay States
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  
  // Notification Dropdown States
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [hasUnread, setHasUnread] = useState(true)

  // PWA Prompt State
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('profileName')
      if (savedName) {
        setProfileName(savedName)
      }

      // Detect if PWA prompt should show
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
      const isDismissed = localStorage.getItem('neracague_pwa_dismissed') === 'true'

      if (isMobile && !isStandalone && !isDismissed) {
        // Show after 3 seconds delay for smoother UX
        const timer = setTimeout(() => setShowPwaPrompt(true), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname])

  // Sync Search Query to IndexedDB Transactions
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    getAllTransactions().then((txs) => {
      const filtered = txs.filter((t) => 
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      )
      setSearchResults(filtered)
    }).catch(err => console.error(err))
  }, [searchQuery])

  // Load dynamic goal achieved notifications + tips
  useEffect(() => {
    const savedGoals = localStorage.getItem('neracague_goals')
    if (savedGoals) {
      try {
        const goals = JSON.parse(savedGoals)
        getAllTransactions().then((txs) => {
          const completedGoals: string[] = []
          for (const g of goals) {
            // Calculate accumulation
            const current = txs
              .filter((t) => {
                const descMatch = t.description?.toLowerCase().includes(g.keyword.toLowerCase())
                const catMatch = t.category?.toLowerCase().includes(g.keyword.toLowerCase())
                return descMatch || catMatch
              })
              .reduce((sum, t) => sum + t.amount, 0)

            if (current >= g.targetAmount) {
              completedGoals.push(`Target "${g.title}" telah tercapai 100%! 🎉`)
            }
          }
          setNotifications([
            ...completedGoals,
            "💡 biji kipli menyarankan Anda mengontrol biaya makanan hari ini.",
            "⚠️ Pengeluaran belanja Anda terpantau meningkat dari minggu kemarin.",
          ])
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      setNotifications([
        "💡 Selamat datang di neracague! Catat transaksi pertama Anda.",
        "💡 biji kipli siap membantu mencatat pengeluaran Anda otomatis lewat Chat.",
      ])
    }
  }, [pathname])

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
      href: '/debts',
      label: 'Utang & Cicilan',
      icon: CreditCard,
      active: pathname === '/debts',
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header (Desktop only) */}
        <div className="hidden md:flex items-center justify-between px-10 py-6 bg-white border-b border-slate-100/50 flex-shrink-0 relative">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Hi, {profileName}</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Berikut adalah ringkasan aktivitas keuangan pribadi Anda.</p>
          </div>
          
          {/* Header Right Actions */}
          <div className="flex items-center gap-4 relative">
            {/* Search Icon Button */}
            <button 
              onClick={() => setShowSearchModal(true)}
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100/50"
              title="Cari Transaksi"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>
            
            {/* Notification Bell Button */}
            <button 
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown)
                setHasUnread(false)
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer relative border border-transparent hover:border-slate-100/50"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotificationDropdown && (
              <div className="absolute right-0 top-14 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4.5 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-250">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h4 className="text-xs font-bold text-slate-800">Notifikasi</h4>
                  <button 
                    onClick={() => setShowNotificationDropdown(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl text-[10px] font-semibold text-slate-600 leading-normal">
                      {notif}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* SEARCH INTERACTIVE MODAL OVERLAY */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[400px] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-1 pr-4">
                <Search className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari deskripsi, nominal, atau kategori..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => {
                  setShowSearchModal(false)
                  setSearchQuery('')
                }}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Content - Results */}
            <div className="flex-1 overflow-y-auto p-5">
              {searchQuery.trim().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                  <Search className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">Mulai ketik untuk mencari riwayat transaksi</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((tx) => {
                    const isIncome = tx.type === 'INCOME'
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-55/20 bg-[#F8F9FD] rounded-2xl border border-slate-50">
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{tx.description}</p>
                          <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{tx.category} • {formatDate(tx.date)}</p>
                        </div>
                        <span className={`text-xs font-extrabold flex-shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                  <X className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PWA INSTALLATION PROMPT BOTTOM SHEET */}
      {showPwaPrompt && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-slate-900 text-white rounded-3xl p-5 shadow-2xl z-[99999] border border-slate-800 flex flex-col gap-3 animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📲</span>
              <h4 className="text-xs font-bold tracking-tight text-slate-100">Pasang Neracague</h4>
            </div>
            <button 
              onClick={() => setShowPwaPrompt(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <p className="text-[10px] font-semibold text-slate-300 leading-normal">
            Dapatkan notifikasi real-time & update terbaru di layar HP kamu:
          </p>
          <div className="space-y-1.5 p-3 bg-slate-850 bg-slate-800/40 rounded-2xl border border-slate-800 text-[10px] font-bold text-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 bg-slate-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
              <span>Klik tombol **Bagikan** (Share 📤) di bilah browser.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 bg-slate-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
              <span>Pilih **&quot;Tambah ke Layar Utama&quot;** (➕).</span>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.setItem('neracague_pwa_dismissed', 'true')
              setShowPwaPrompt(false)
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold py-2.5 rounded-xl border border-slate-700/50 cursor-pointer"
          >
            Jangan Tampilkan Lagi
          </button>
        </div>
      )}

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  )
}
