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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 h-4 bg-slate-200 rounded w-20 animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Pemasukan',
      value: income,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pengeluaran',
      value: expense,
      icon: TrendingDown,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Sisa Saldo',
      value: balance,
      icon: Wallet,
      iconColor: balance >= 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: balance >= 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(card.value)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bulan ini
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
