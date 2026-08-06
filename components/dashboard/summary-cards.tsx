'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function SummaryCards({
  income,
  expense,
  balance,
  transactions = [],
  isLoading,
}: SummaryCardsProps) {
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-slate-100/80 shadow-sm bg-white rounded-3xl animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-8 bg-slate-100 rounded w-28" />
              </div>
              <div className="h-10 w-10 bg-slate-100 rounded-2xl" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 mt-auto">
              <div className="h-12 bg-slate-50 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Filter transactions for modals
  const incomeTransactions = transactions.filter((t) => t.type === 'INCOME')
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. BALANCE CARD (Solid Indigo + Mini Bar Chart) */}
      <Card className="border-0 shadow-md hover:shadow-lg bg-[#3E6BEC] text-white rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 select-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-6 px-6">
          <div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Sisa Saldo</p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">
              {formatCurrency(balance)}
            </h2>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 mt-auto">
          <div className="flex items-end justify-between h-12 w-full gap-1.5 px-0.5">
            {[35, 60, 45, 75, 50, 85, 65, 40, 90, 70].map((h, i) => (
              <div 
                key={i} 
                style={{ height: `${h}%` }} 
                className="w-full bg-white/25 rounded-full hover:bg-white transition-all duration-200"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. INCOME CARD (White + Glowing Green Upward Wave) */}
      <Card 
        onClick={() => setShowIncomeModal(true)}
        className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-800 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 cursor-pointer select-none active:scale-98"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-6 px-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pemasukan</p>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
              {formatCurrency(income)}
            </h2>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100/30">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4 pt-0 mt-auto">
          {/* Glowing Upward Mini Wave Chart */}
          <div className="h-14 w-full">
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

      {/* 3. EXPENSE CARD (White + Glowing Red Downward Wave) */}
      <Card 
        onClick={() => setShowExpenseModal(true)}
        className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-800 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 cursor-pointer select-none active:scale-98"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-6 px-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengeluaran</p>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
              {formatCurrency(expense)}
            </h2>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100/30">
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4 pt-0 mt-auto">
          {/* Glowing Downward Mini Wave Chart */}
          <div className="h-14 w-full">
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
