'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, X, CreditCard, Plus, Check, ChevronRight, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils-extended'
import { getAllDebts, addDebt, updateDebt, deleteDebt, addTransaction } from '@/lib/db/indexeddb'
import type { Transaction } from '@/types/transaction'
import type { Debt } from '@/types/debt'

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
  totalDebt: initialTotalDebt,
  profileName = 'Sobat Neracague',
  transactions = [],
  isLoading,
}: SummaryCardsProps) {
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showDebtsModal, setShowDebtsModal] = useState(false)

  // Debts management states
  const [debts, setDebts] = useState<Debt[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTotal, setNewTotal] = useState('')
  const [newInstallment, setNewInstallment] = useState('')
  const [newRemaining, setNewRemaining] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  // Installment payment states
  const [selectedPayDebt, setSelectedPayDebt] = useState<Debt | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [recordAsTransaction, setRecordAsTransaction] = useState(true)

  // Load debts from database
  const loadDebtsData = async () => {
    try {
      const allDebts = await getAllDebts()
      setDebts(allDebts.reverse())
    } catch (e) {
      console.error('Error loading debts:', e)
    }
  }

  // Load debts on component mount or modal open
  useEffect(() => {
    loadDebtsData()
  }, [showDebtsModal])

  // Handle adding new debt in modal
  const handleAddNewDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newTotal || !newInstallment || !newRemaining || !newDueDate) return

    try {
      await addDebt({
        title: newTitle.trim(),
        totalAmount: Number(newTotal),
        monthlyInstallment: Number(newInstallment),
        remainingAmount: Number(newRemaining),
        dueDate: newDueDate.trim(),
        createdAt: Date.now(),
      })

      // Reset form fields
      setNewTitle('')
      setNewTotal('')
      setNewInstallment('')
      setNewRemaining('')
      setNewDueDate('')
      setShowAddForm(false)
      
      // Reload debts data
      await loadDebtsData()

      // Reload dashboard elements
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error('Error adding debt:', err)
    }
  }

  // Handle deleting a debt
  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kewajiban utang/cicilan ini?')) return
    try {
      await deleteDebt(id)
      await loadDebtsData()
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error(err)
    }
  }

  // Handle paying an installment
  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayDebt || !payAmount) return

    const payVal = Number(payAmount)
    const newRemaining = Math.max(0, selectedPayDebt.remainingAmount - payVal)

    try {
      // Update remaining amount in database
      await updateDebt(selectedPayDebt.id, {
        remainingAmount: newRemaining,
      })

      // Record in main transactions list
      if (recordAsTransaction) {
        const todayStr = new Date().toISOString().split('T')[0]
        await addTransaction({
          amount: payVal,
          category: 'Tagihan',
          description: `Bayar cicilan ${selectedPayDebt.title}`,
          type: 'EXPENSE',
          date: todayStr,
          createdAt: Date.now(),
        })
      }

      setPayAmount('')
      setSelectedPayDebt(null)
      await loadDebtsData()

      // Force full reload of dashboard state (to update total balance and list)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-slate-100/80 shadow-sm bg-white rounded-3xl animate-pulse h-32" />
        ))}
      </div>
    )
  }

  // Aggregate stats
  const totalDebtBalance = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalMonthlyCommitment = debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)
  const totalOriginalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPayoffRatio = totalOriginalDebt > 0 
    ? Math.round(((totalOriginalDebt - totalDebtBalance) / totalOriginalDebt) * 100)
    : 0

  const activeTotalDebt = debts.length > 0 ? totalDebtBalance : initialTotalDebt

  // Filter transactions for modals
  const incomeTransactions = transactions.filter((t) => t.type === 'INCOME')
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE')

  return (
    <div className="space-y-6">
      {/* 4-Column Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: Sisa Saldo (Non-clickable) */}
        <Card className="border border-slate-100 shadow-sm bg-white text-slate-850 rounded-3xl overflow-hidden flex flex-col justify-between h-36 select-none relative">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50/20 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo</p>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                {formatCurrency(balance)}
              </h3>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                Saldo bersih saat ini
              </span>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100/30">
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <div className="px-5.5 pb-5 pt-0 mt-auto flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>Kas & Bank</span>
            <span>Tersedia</span>
          </div>
        </Card>

        {/* CARD 2: Pemasukan (Clickable) */}
        <Card 
          onClick={() => setShowIncomeModal(true)}
          className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 cursor-pointer select-none active:scale-98"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pemasukan</p>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                {formatCurrency(income)}
              </h3>
              <span className="text-[9px] font-extrabold text-emerald-600 mt-1 block">
                +10% Bulan Ini
              </span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/30">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 mt-auto">
            <div className="h-10 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="incomeMiniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <path d="M0,24 C15,22 25,18 45,15 C65,11 80,13 100,6 L100,30 L0,30 Z" fill="url(#incomeMiniGrad)" />
                <path d="M0,24 C15,22 25,18 45,15 C65,11 80,13 100,6" fill="none" stroke="#10b981" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: Pengeluaran (Clickable) */}
        <Card 
          onClick={() => setShowExpenseModal(true)}
          className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 cursor-pointer select-none active:scale-98"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pengeluaran</p>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                {formatCurrency(expense)}
              </h3>
              <span className="text-[9px] font-extrabold text-rose-600 mt-1 block">
                -2% Bulan Ini
              </span>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100/30">
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 mt-auto">
            <div className="h-10 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="expenseMiniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <path d="M0,8 C20,10 35,16 55,19 C75,23 85,26 100,27 L100,30 L0,30 Z" fill="url(#expenseMiniGrad)" />
                <path d="M0,8 C20,10 35,16 55,19 C75,23 85,26 100,27" fill="none" stroke="#ef4444" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* CARD 4: Utang & Cicilan (Clickable to open Debts Modal) */}
        <Card 
          onClick={() => setShowDebtsModal(true)}
          className="border border-slate-100 shadow-sm hover:shadow-md bg-white text-slate-850 rounded-3xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-36 cursor-pointer select-none active:scale-98"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5 px-5.5">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utang & Cicilan</p>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
                {formatCurrency(activeTotalDebt)}
              </h3>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                Klik untuk kelola utang
              </span>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100/30">
              <CreditCard className="w-4 h-4 text-[#3E6BEC]" />
            </div>
          </CardHeader>
          <CardContent className="px-5.5 pb-5 pt-0 mt-auto">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>Rasio Beban</span>
                <span>{debts.length > 0 ? `${totalPayoffRatio}%` : 'Aktif'}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: debts.length > 0 ? `${totalPayoffRatio}%` : '45%' }}
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
                  <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-55 bg-[#F8F9FD] border border-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors">
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
                  <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-55 bg-[#F8F9FD] border border-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors">
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

      {/* FULLY FUNCTIONAL DEBTS POPUP DIALOG */}
      {showDebtsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 text-slate-850 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#3E6BEC]" /> Kelola Utang & Cicilan
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Daftar beban pinjaman & paylater aktif</p>
              </div>
              <button 
                onClick={() => {
                  setShowDebtsModal(false)
                  setShowAddForm(false)
                }}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Aggregated Stats Row */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Pokok Utang</span>
                  <span className="text-sm font-black text-slate-700 mt-1 block">{formatCurrency(totalDebtBalance)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Beban Bulanan</span>
                  <span className="text-sm font-black text-indigo-600 mt-1 block">{formatCurrency(totalMonthlyCommitment)}</span>
                </div>
              </div>

              {/* Collapsible Add Debt trigger */}
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800">Daftar Kewajiban</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-[10px] font-bold text-[#3E6BEC] bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100/20 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3 h-3" /> {showAddForm ? 'Sembunyikan Form' : 'Tambah Utang'}
                </button>
              </div>

              {/* Collapsible Add Form */}
              {showAddForm && (
                <form onSubmit={handleAddNewDebt} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nama Utang / Cicilan</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Gopaylater, Cicilan HP"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Pokok (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newTotal}
                        onChange={(e) => setNewTotal(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sisa Utang (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newRemaining}
                        onChange={(e) => setNewRemaining(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cicilan Bulanan (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newInstallment}
                        onChange={(e) => setNewInstallment(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jatuh Tempo</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Tanggal 25"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#3E6BEC] hover:bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl shadow-sm cursor-pointer transition-all"
                  >
                    Simpan Kewajiban
                  </button>
                </form>
              )}

              {/* Debts List */}
              <div className="space-y-2.5">
                {debts.length > 0 ? (
                  debts.map((d) => {
                    const ratio = d.totalAmount > 0 
                      ? Math.round(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100)
                      : 0

                    return (
                      <div key={d.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-2.5 hover:border-slate-200 transition-all shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-extrabold text-slate-800">{d.title}</span>
                            <span className="text-[9px] font-semibold text-slate-400 ml-1.5">• Jatuh Tempo: {d.dueDate}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteDebt(d.id)}
                            className="text-[9px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>

                        {/* Progress Bar of payback ratio */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                            <span>Sisa Pokok: {formatCurrency(d.remainingAmount)} / {formatCurrency(d.totalAmount)}</span>
                            <span>{ratio}% Lunas</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${ratio}%` }} />
                          </div>
                        </div>

                        {/* Action details & Pay Installment button */}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-slate-500">
                            Tagihan: <span className="text-indigo-650 font-black">{formatCurrency(d.monthlyInstallment)} / bln</span>
                          </span>
                          
                          {d.remainingAmount > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayDebt(d)
                                setPayAmount(String(d.monthlyInstallment))
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              Bayar Cicilan
                            </button>
                          ) : (
                            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md select-none">
                              Lunas 🎉
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center">
                    <span>💵</span>
                    <p className="mt-2">Belum ada cicilan atau utang aktif.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* NESTED PAYMENT SUBMISSION MODAL */}
      {selectedPayDebt && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 flex-shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Bayar Cicilan</CardTitle>
                <CardDescription className="text-xs text-slate-400">Pembayaran untuk {selectedPayDebt.title}</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedPayDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <form onSubmit={handlePayInstallment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominal Pembayaran (Rp)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Sisa saldo utang pokok saat ini: {formatCurrency(selectedPayDebt.remainingAmount)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="recordTx"
                    checked={recordAsTransaction}
                    onChange={(e) => setRecordAsTransaction(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200"
                  />
                  <label htmlFor="recordTx" className="text-[10px] font-bold text-slate-650 text-slate-600 cursor-pointer">
                    Catat ke Riwayat Transaksi sebagai Pengeluaran
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    Bayar Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayDebt(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
