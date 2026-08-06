'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  addDebt, 
  getAllDebts, 
  updateDebt, 
  deleteDebt, 
  addTransaction 
} from '@/lib/db/indexeddb'
import { formatCurrency } from '@/lib/utils-extended'
import type { Debt } from '@/types/debt'
import { Plus, Trash2, Calendar, CreditCard, ChevronRight, Check, X, PiggyBank } from 'lucide-react'

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals visibility states
  const [showAddModal, setShowAddModal] = useState(false)
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<Debt | null>(null)

  // Add Debt Form States
  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [monthlyInstallment, setMonthlyInstallment] = useState('')
  const [remainingAmount, setRemainingAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Payment Form States
  const [paymentAmount, setPaymentAmount] = useState('')
  const [recordTransaction, setRecordTransaction] = useState(true)

  const loadDebts = async () => {
    setIsLoading(true)
    try {
      const allDebts = await getAllDebts()
      setDebts(allDebts.reverse())
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDebts()
  }, [])

  const handleAddDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !totalAmount || !monthlyInstallment || !remainingAmount || !dueDate) return

    try {
      await addDebt({
        title: title.trim(),
        totalAmount: Number(totalAmount),
        monthlyInstallment: Number(monthlyInstallment),
        remainingAmount: Number(remainingAmount),
        dueDate: dueDate.trim(),
        createdAt: Date.now(),
      })

      // Reset form & reload
      setTitle('')
      setTotalAmount('')
      setMonthlyInstallment('')
      setRemainingAmount('')
      setDueDate('')
      setShowAddModal(false)
      loadDebts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kewajiban utang/cicilan ini?')) return
    try {
      await deleteDebt(id)
      loadDebts()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentTargetDebt || !paymentAmount) return

    const payVal = Number(paymentAmount)
    const newRemaining = Math.max(0, paymentTargetDebt.remainingAmount - payVal)

    try {
      // Update remaining principal of the debt
      await updateDebt(paymentTargetDebt.id, {
        remainingAmount: newRemaining,
      })

      // Add to general transactions ledger if checked
      if (recordTransaction) {
        const todayStr = new Date().toISOString().split('T')[0]
        await addTransaction({
          amount: payVal,
          category: 'Tagihan',
          description: `Bayar cicilan ${paymentTargetDebt.title}`,
          type: 'EXPENSE',
          date: todayStr,
          createdAt: Date.now(),
        })
      }

      setPaymentAmount('')
      setPaymentTargetDebt(null)
      loadDebts()
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate Aggregates
  const totalDebtBalance = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalMonthlyCommitment = debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)
  const totalOriginalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPayoffRatio = totalOriginalDebt > 0 
    ? Math.round(((totalOriginalDebt - totalDebtBalance) / totalOriginalDebt) * 100)
    : 0

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <Header title="Utang & Cicilan" subtitle="Pantau dan kelola kewajiban bulanan Anda" />
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Utang
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: Total Remaining Principal */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl p-6 flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center z-10">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sisa Saldo Utang</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
                    {formatCurrency(totalDebtBalance)}
                  </h3>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                </div>
              </div>
            </Card>

            {/* CARD 2: Monthly Commitment */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl p-6 flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center z-10">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Beban Cicilan Bulanan</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
                    {formatCurrency(totalMonthlyCommitment)}
                  </h3>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-2xl">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </Card>

            {/* CARD 3: Payoff Ratio */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl p-6 flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center z-10">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Progres Pelunasan</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
                    {totalPayoffRatio}%
                  </h3>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-2xl">
                  <PiggyBank className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalPayoffRatio}%` }}
                />
              </div>
            </Card>
          </div>

          {/* ACTIVE DEBTS LIST */}
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Daftar Utang & Cicilan Aktif</CardTitle>
              <CardDescription className="text-xs text-slate-400">Pantau dan kelola sisa tagihan pinjaman/paylater</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {debts.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <span className="text-4xl">🎉</span>
                  <p className="text-slate-400 text-sm mt-3 font-bold">Hebat! Kamu bebas dari utang & cicilan</p>
                  <p className="text-slate-400 text-xs mt-1">Gunakan uang dingin untuk investasi cerdas.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {debts.map((d) => {
                    const payRatio = Math.round(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100)
                    return (
                      <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                        {/* Title & Installment Detail */}
                        <div className="space-y-1 truncate max-w-[200px]">
                          <h4 className="text-sm font-extrabold text-slate-800 truncate">{d.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> J.Tempo: {d.dueDate} • Cicilan: {formatCurrency(d.monthlyInstallment)}/bln
                          </p>
                        </div>

                        {/* Payoff Ratio Bar */}
                        <div className="flex-1 sm:max-w-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>Pelunasan</span>
                            <span>{payRatio}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full" 
                              style={{ width: `${payRatio}%` }}
                            />
                          </div>
                          <p className="text-[9px] font-semibold text-slate-450 text-slate-400 text-right">
                            {formatCurrency(d.totalAmount - d.remainingAmount)} dibayar dari {formatCurrency(d.totalAmount)}
                          </p>
                        </div>

                        {/* Remaining amount & Action buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sisa Pokok</span>
                            <p className="text-sm font-extrabold text-rose-500">{formatCurrency(d.remainingAmount)}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {d.remainingAmount > 0 && (
                              <button
                                onClick={() => setPaymentTargetDebt(d)}
                                className="bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                              >
                                Bayar
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDebt(d.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DIALOG: TAMBAH UTANG BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 flex-shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Tambah Utang & Cicilan</CardTitle>
                <CardDescription className="text-xs text-slate-400">Catat kewajiban atau cicilan paylater baru</CardDescription>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </CardHeader>

            <form onSubmit={handleAddDebtSubmit}>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Cicilan / Utang</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kredivo Laptop, SPaylater Baju"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Batas Utang</label>
                    <input 
                      type="number" 
                      value={totalAmount} 
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="e.g. 5000000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sisa Pokok Utang</label>
                    <input 
                      type="number" 
                      value={remainingAmount} 
                      onChange={(e) => setRemainingAmount(e.target.value)}
                      placeholder="e.g. 3500000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cicilan Bulanan (Rp)</label>
                    <input 
                      type="number" 
                      value={monthlyInstallment} 
                      onChange={(e) => setMonthlyInstallment(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal J.Tempo</label>
                    <input 
                      type="text" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="e.g. Tgl 5 / Tgl 25"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" /> Batal
                  </button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL DIALOG: BAYAR CICILAN */}
      {paymentTargetDebt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 flex-shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Bayar Cicilan</CardTitle>
                <CardDescription className="text-xs text-slate-400">Catat pembayaran untuk: {paymentTargetDebt.title}</CardDescription>
              </div>
              <button 
                onClick={() => setPaymentTargetDebt(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </CardHeader>

            <form onSubmit={handlePaymentSubmit}>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Pembayaran (Rp)</label>
                  <input 
                    type="number" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Saran cicilan: Rp ${paymentTargetDebt.monthlyInstallment.toLocaleString('id-ID')}`}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    max={paymentTargetDebt.remainingAmount}
                    required
                    autoFocus
                  />
                  <p className="text-[9px] font-semibold text-slate-450 text-slate-400 mt-1">
                    Sisa utang saat ini: <span className="font-extrabold text-rose-500">{formatCurrency(paymentTargetDebt.remainingAmount)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 py-1 select-none">
                  <input 
                    type="checkbox" 
                    id="recordTx"
                    checked={recordTransaction}
                    onChange={(e) => setRecordTransaction(e.target.checked)}
                    className="w-4.5 h-4.5 accent-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="recordTx" className="text-xs font-semibold text-slate-600 cursor-pointer">
                    Catat ke Riwayat Transaksi sebagai **Tagihan**
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Bayar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTargetDebt(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" /> Batal
                  </button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </MainLayout>
  )
}
