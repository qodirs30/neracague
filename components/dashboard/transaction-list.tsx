'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, X, Check } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import type { Transaction, TransactionCategory } from '@/types/transaction'

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Transaction>) => void;
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

const CATEGORY_OPTIONS = [
  'Makanan',
  'Transportasi',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Belanja',
  'Pendapatan',
  'Lainnya',
]

type FilterPeriod = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function TransactionList({
  transactions,
  onDelete,
  onUpdate,
  isLoading,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Date filter period state
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('ALL')

  // Edit form states
  const [editDesc, setEditDesc] = useState('')
  const [editAmount, setEditAmount] = useState<number>(0)
  const [editCategory, setEditCategory] = useState<TransactionCategory>('Makanan')
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [editDate, setEditDate] = useState('')

  const handleStartEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setEditDesc(t.description)
    setEditAmount(t.amount)
    setEditCategory(t.category)
    setEditType(t.type)
    setEditDate(t.date)
  }

  const handleSaveEdit = () => {
    if (!editingTransaction || !onUpdate) return
    onUpdate(editingTransaction.id, {
      description: editDesc.trim(),
      amount: Number(editAmount),
      category: editCategory,
      type: editType,
      date: editDate,
    })
    setEditingTransaction(null)
  }

  // Filter transactions based on selected date period
  const filteredTransactions = transactions.filter((t) => {
    if (filterPeriod === 'ALL') return true

    const txDate = new Date(t.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filterPeriod === 'TODAY') {
      return txDate.toDateString() === today.toDateString()
    }

    if (filterPeriod === 'WEEK') {
      const dayOfWeek = today.getDay()
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Start of week (Monday)
      const startOfWeek = new Date(today.setDate(diff))
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      return txDate >= startOfWeek && txDate <= endOfWeek
    }

    if (filterPeriod === 'MONTH') {
      const currentMonth = new Date()
      return (
        txDate.getMonth() === currentMonth.getMonth() &&
        txDate.getFullYear() === currentMonth.getFullYear()
      )
    }

    if (filterPeriod === 'YEAR') {
      const currentYear = new Date()
      return txDate.getFullYear() === currentYear.getFullYear()
    }

    return true
  })

  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[380px]">
        <CardHeader>
          <CardTitle className="h-5 bg-slate-100 rounded w-40 animate-pulse" />
          <CardDescription className="h-4 bg-slate-100 rounded w-20 mt-1 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[380px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-2 pt-6 px-6 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-800">Riwayat Transaksi</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full select-none">
            {filteredTransactions.length} Transaksi
          </span>
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">Daftar mutasi pengeluaran & pendapatan Anda</CardDescription>
      </CardHeader>

      {/* HORIZONTAL DATE FILTER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 px-6 flex-shrink-0 border-b border-slate-50">
        {([
          { code: 'ALL', label: 'Semua' },
          { code: 'TODAY', label: 'Hari Ini' },
          { code: 'WEEK', label: 'Minggu Ini' },
          { code: 'MONTH', label: 'Bulan Ini' },
          { code: 'YEAR', label: 'Tahun Ini' },
        ] as { code: FilterPeriod; label: string }[]).map((period) => {
          const isActive = filterPeriod === period.code
          return (
            <button
              key={period.code}
              onClick={() => setFilterPeriod(period.code)}
              className={`text-[9px] font-bold px-3 py-1.5 rounded-full select-none cursor-pointer border transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-100 hover:text-slate-705 hover:text-slate-750 hover:bg-slate-50'
              }`}
            >
              {period.label}
            </button>
          )
        })}
      </div>
      
      <CardContent className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full">
            <span className="text-3xl">📦</span>
            <p className="text-slate-400 text-xs mt-3 font-bold">Belum ada transaksi di periode ini</p>
          </div>
        ) : (
          <div className="space-y-2.5 pr-0.5">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === 'INCOME'
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-[#F8F9FD] rounded-2xl transition-all duration-200 border border-slate-50 hover:border-slate-100/50"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                      {CATEGORY_ICONS[transaction.category] || '📦'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                        <Badge
                          variant={isIncome ? 'income' : 'expense'}
                          className={`text-[9px] font-extrabold px-1.5 py-0 border-0 rounded-md select-none ${
                            isIncome 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isIncome ? 'Masuk' : 'Keluar'}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {transaction.category}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          • {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <div
                      className={`text-xs font-bold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {onUpdate && (
                        <button
                          onClick={() => handleStartEdit(transaction)}
                          className="p-1.5 text-slate-400 hover:text-[#3E6BEC] hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* POPUP EDIT TRANSACTION DIALOG */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 flex-shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Ubah Transaksi</CardTitle>
                <CardDescription className="text-xs text-slate-400">Sunting informasi mutasi</CardDescription>
              </div>
              <button 
                onClick={() => setEditingTransaction(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </CardHeader>
            
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi</label>
                <input 
                  type="text" 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={editAmount} 
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe</label>
                  <select 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value as 'INCOME' | 'EXPENSE')}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="EXPENSE">Keluar</option>
                    <option value="INCOME">Masuk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                  <select 
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value as TransactionCategory)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Simpan
                </button>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" /> Batal
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}
