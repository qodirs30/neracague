'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const CATEGORY_ICONS: { [key: string]: string } = {
  Makanan: '🍽️',
  Transportasi: '🚗',
  Tagihan: '💳',
  Hiburan: '🎬',
  Kesehatan: '🏥',
  Belanja: '🛍️',
  Pendapatan: '💰',
  Lainnya: '📦',
}

export function TransactionList({
  transactions,
  onDelete,
  isLoading,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="h-5 bg-slate-100 rounded w-40 animate-pulse" />
          <CardDescription className="h-4 bg-slate-100 rounded w-20 mt-1 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl animate-pulse">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded w-32" />
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-800">Riwayat Transaksi</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {transactions.length} Transaksi
          </span>
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">Daftar mutasi pengeluaran & pendapatan Anda</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {transactions.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <span className="text-4xl">📦</span>
            <p className="text-slate-400 text-sm mt-3 font-semibold">Belum ada transaksi tercatat</p>
            <p className="text-slate-400 text-xs mt-1">Gunakan fitur catat atau chat biji kipli!</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === 'INCOME'
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Icon Circle */}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                      {CATEGORY_ICONS[transaction.category] || '📦'}
                    </div>
                    
                    {/* Content details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                        <Badge
                          variant={isIncome ? 'income' : 'expense'}
                          className={`text-[10px] font-bold px-1.5 py-0 border-0 ${
                            isIncome 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isIncome ? 'Masuk' : 'Keluar'}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-500">
                          {transaction.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          • {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount and delete action */}
                  <div className="flex items-center gap-3 ml-4">
                    <div
                      className={`text-sm font-bold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
