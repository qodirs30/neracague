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
          <Card key={i} className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 bg-slate-100 rounded w-28 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-20 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Pemasukan',
      value: income,
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70 border border-emerald-100/30',
      borderColor: 'border-t-4 border-t-emerald-500',
      trendIcon: ArrowUpRight,
      trendColor: 'text-emerald-600',
      trendText: 'Uang masuk bulan ini',
    },
    {
      title: 'Total Pengeluaran',
      value: expense,
      icon: TrendingDown,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/70 border border-rose-100/30',
      borderColor: 'border-t-4 border-t-rose-500',
      trendIcon: ArrowDownRight,
      trendColor: 'text-rose-600',
      trendText: 'Uang keluar bulan ini',
    },
    {
      title: 'Sisa Saldo',
      value: balance,
      icon: Wallet,
      iconColor: balance >= 0 ? 'text-indigo-600' : 'text-rose-600',
      bgColor: balance >= 0 ? 'bg-indigo-50/70 border border-indigo-100/30' : 'bg-rose-50/70 border border-rose-100/30',
      borderColor: balance >= 0 ? 'border-t-4 border-t-indigo-500' : 'border-t-4 border-t-rose-500',
      trendIcon: balance >= 0 ? ArrowUpRight : ArrowDownRight,
      trendColor: balance >= 0 ? 'text-indigo-600' : 'text-rose-600',
      trendText: balance >= 0 ? 'Kondisi keuangan surplus' : 'Keuangan defisit',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trendIcon
        return (
          <Card 
            key={card.title} 
            className={`border border-slate-100/80 shadow-sm hover:shadow-md bg-white rounded-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${card.borderColor}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-xl`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(card.value)}
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <TrendIcon className={`w-4 h-4 ${card.trendColor}`} />
                <span className="text-xs font-semibold text-slate-500">
                  {card.trendText}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
