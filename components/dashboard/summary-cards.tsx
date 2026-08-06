'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-extended'

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  isLoading?: boolean;
}

export function SummaryCards({
  income,
  expense,
  balance,
  isLoading,
}: SummaryCardsProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. BALANCE CARD (Solid Indigo + Mini Bar Chart) */}
      <Card className="border-0 shadow-md hover:shadow-lg bg-[#3E6BEC] text-white rounded-3xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48">
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
          {/* Mini Bar Chart */}
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

      {/* 2. INCOME CARD (White + Glowing Green Wave) */}
      <Card className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-800 rounded-3xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48">
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
          {/* Glowing Mini Wave Chart */}
          <div className="h-14 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="incomeMiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                {/* Glow Filter */}
                <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path 
                d="M0,22 C15,10 25,5 45,15 C60,22 75,5 100,18 L100,30 L0,30 Z" 
                fill="url(#incomeMiniGrad)"
              />
              <path 
                d="M0,22 C15,10 25,5 45,15 C60,22 75,5 100,18" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth={2.5}
                strokeLinecap="round"
                filter="url(#greenGlow)"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* 3. EXPENSE CARD (White + Glowing Red Wave) */}
      <Card className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-800 rounded-3xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-48">
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
          {/* Glowing Mini Wave Chart */}
          <div className="h-14 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="expenseMiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                {/* Glow Filter */}
                <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path 
                d="M0,18 C20,25 35,5 55,20 C75,30 85,5 100,15 L100,30 L0,30 Z" 
                fill="url(#expenseMiniGrad)"
              />
              <path 
                d="M0,18 C20,25 35,5 55,20 C75,30 85,5 100,15" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth={2.5}
                strokeLinecap="round"
                filter="url(#redGlow)"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
