'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
          <Card key={i} className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-8 bg-slate-100 rounded w-28 animate-pulse" />
              <div className="h-12 bg-slate-55/30 rounded-lg animate-pulse" />
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

      {/* 2. INCOME CARD (White + Mini Green Wave) */}
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
          {/* Mini Wave Chart */}
          <div className="h-14 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="incomeMiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path 
                d="M0,28 Q15,12 30,20 T65,8 T85,15 T100,28 L100,30 L0,30 Z" 
                fill="url(#incomeMiniGrad)"
              />
              <path 
                d="M0,28 Q15,12 30,20 T65,8 T85,15 T100,28" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* 3. EXPENSE CARD (White + Mini Red Wave) */}
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
          {/* Mini Wave Chart */}
          <div className="h-14 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="expenseMiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path 
                d="M0,28 Q20,10 40,24 T80,14 T100,28 L100,30 L0,30 Z" 
                fill="url(#expenseMiniGrad)"
              />
              <path 
                d="M0,28 Q20,10 40,24 T80,14 T100,28" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
