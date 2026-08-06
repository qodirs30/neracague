'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                  <div className="h-3 bg-slate-200 rounded w-40" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Riwayat Transaksi</span>
          <span className="text-sm font-normal text-slate-500">
            {transactions.length} transaksi
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-xl">
                    {CATEGORY_ICONS[transaction.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={transaction.type === 'INCOME' ? 'income' : 'expense'}
                        className="text-xs"
                      >
                        {transaction.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {transaction.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-sm font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
