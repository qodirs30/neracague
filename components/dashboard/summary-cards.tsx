'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, X, ChevronLeft, ChevronRight, UserPlus, CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  totalDebt: number;
  profileName?: string;
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function SummaryCards({
  income,
  expense,
  balance,
  totalDebt,
  profileName = 'Sobat Neracague',
  transactions = [],
  isLoading,
}: SummaryCardsProps) {
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  // Current Month Display Helper
  const getFormattedMonthYear = () => {
    const d = new Date()
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-slate-100/80 shadow-sm bg-white rounded-3xl animate-pulse h-28" />
          ))}
        </div>
      </div>
    )
  }

  // Filter transactions for modals
  const incomeTransactions = transactions.filter((t) => t.type === 'INCOME')
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE')

  return (
    <div className="space-y-6">
      {/* 1. TOP PURPLE BANNER CARD (My Budget Hero block) */}
      <div className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] text-white p-6 rounded-3xl relative overflow-hidden shadow-lg border border-[#8B5CF6]/30 flex flex-col justify-between min-h-[210px] select-none animate-in fade-in slide-in-from-top-4 duration-300">
        
        {/* Background decorative blob shapes */}
        <div className="absolute right-0 top-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top section: Profile & Date Navigator */}
        <div className="flex items-center justify-between z-10 w-full">
          {/* User profile section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-white/10 shadow-inner flex-shrink-0">
              <Image 
                src="/placeholder-user.jpg" 
                alt="Profile Avatar" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-extrabold tracking-wide text-white">{profileName}</h4>
              <p className="text-[10px] font-bold text-white/70 mt-0.5 uppercase tracking-wider">Anggaran Neraca</p>
            </div>
          </div>

          {/* Month Selector Switcher */}
          <div className="flex items-center bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white tracking-wider gap-2 shadow-inner">
            <ChevronLeft className="w-3.5 h-3.5 stroke-[3] cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
            <span className="capitalize">{getFormattedMonthYear()}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3] cursor-pointer hover:scale-110 active:scale-95 transition-transform" />
          </div>
        </div>

        {/* Middle section: Large Balance Center */}
        <div className="my-auto pt-4 pb-2 text-center sm:text-left z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-indigo-100/80 uppercase tracking-widest">Sisa Saldo Terkini</p>
            <h1 className="text-3xl sm:text-4.5xl font-extrabold text-white tracking-tight mt-1.5 filter drop-shadow-sm leading-none">
              {formatCurrency(balance)}
            </h1>
          </div>

          {/* Overlapping Family/Collaborator avatars + Add button */}
          <div className="flex items-center justify-center sm:justify-start gap-1">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border border-[#7C3AED] overflow-hidden bg-slate-100 shadow-sm flex-shrink-0">
                <Image src="/placeholder-user.jpg" alt="Collab 1" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border border-[#7C3AED] overflow-hidden bg-slate-100 shadow-sm flex-shrink-0">
                <Image src="/placeholder-user.jpg" alt="Collab 2" width={28} height={28} className="w-full h-full object-cover" />
              </div>
            </div>
            <button className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm cursor-pointer ml-1">
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE FLOAT CARDS ROW (Income, Expense, Debts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Pemasukan (White + Green Curve) */}
        <Card 
          onClick={() => setShowIncomeModal(true)}
          className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 cursor-pointer select-none active:scale-98"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pemasukan</p>
              <h3 className="text-xl font-extrabold text-slate-850 text-slate-800 tracking-tight mt-1">
                {formatCurrency(income)}
              </h3>
              <span className="text-[9px] font-extrabold text-emerald-600 mt-1 block">
                +10% Bulan Ini
              </span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100/30">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 mt-auto">
            {/* Glowing Upward Mini Wave Chart */}
            <div className="h-10 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="incomeMiniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.0" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d="M0,24 C15,22 25,18 45,15 C65,11 80,13 100,6 L100,30 L0,30 Z" 
                  fill="url(#incomeMiniGrad)"
                />
                <path 
                  d="M0,24 C15,22 25,18 45,15 C65,11 80,13 100,6" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  filter="url(#greenGlow)"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Pengeluaran (White + Red Curve) */}
        <Card 
          onClick={() => setShowExpenseModal(true)}
          className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 cursor-pointer select-none active:scale-98"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pengeluaran</p>
              <h3 className="text-xl font-extrabold text-slate-850 text-slate-800 tracking-tight mt-1">
                {formatCurrency(expense)}
              </h3>
              <span className="text-[9px] font-extrabold text-rose-600 mt-1 block">
                -2% Bulan Ini
              </span>
            </div>
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-100/30">
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 mt-auto">
            {/* Glowing Downward Mini Wave Chart */}
            <div className="h-10 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="expenseMiniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.0" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d="M0,8 C20,10 35,16 55,19 C75,23 85,26 100,27 L100,30 L0,30 Z" 
                  fill="url(#expenseMiniGrad)"
                />
                <path 
                  d="M0,8 C20,10 35,16 55,19 C75,23 85,26 100,27" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  filter="url(#redGlow)"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: Utang & Cicilan (White + Progress Bar) */}
        <Card className="border border-slate-100 shadow-sm hover:shadow bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 select-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utang & Cicilan</p>
              <h3 className="text-xl font-extrabold text-slate-850 text-slate-800 tracking-tight mt-1">
                {formatCurrency(totalDebt)}
              </h3>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block leading-none">
                Total Kewajiban Aktif
              </span>
            </div>
            <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100/30">
              <CreditCard className="w-4 h-4 text-indigo-650 text-[#3E6BEC]" />
            </div>
          </CardHeader>
          <CardContent className="px-5.5 pb-5 pt-0 mt-auto">
            {/* Progress bar representing debt ratio or simple graphic */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>Rasio Beban</span>
                <span>Aktif</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: totalDebt > 0 ? '45%' : '0%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* INCOME DETAIL DIALOG POPUP */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[400px] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Riwayat Pemasukan</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Total: {formatCurrency(income)}</p>
              </div>
              <button 
                onClick={() => setShowIncomeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {incomeTransactions.length > 0 ? (
                incomeTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tx.description}</p>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{tx.category} • {formatDate(tx.date)}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 flex-shrink-0">
                      + {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                  <Wallet className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">Belum ada catatan pemasukan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE DETAIL DIALOG POPUP */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[400px] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Riwayat Pengeluaran</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Total: {formatCurrency(expense)}</p>
              </div>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {expenseTransactions.length > 0 ? (
                expenseTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tx.description}</p>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{tx.category} • {formatDate(tx.date)}</p>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600 flex-shrink-0">
                      - {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                  <Wallet className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">Belum ada catatan pengeluaran.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
