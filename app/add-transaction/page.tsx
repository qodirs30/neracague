'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { addTransaction } from '@/lib/db/indexeddb'
import { getToday } from '@/lib/utils-extended'
import { Camera, RefreshCw } from 'lucide-react'
import type { TransactionType, TransactionCategory } from '@/types/transaction'

const CATEGORIES: TransactionCategory[] = [
  'Makanan',
  'Transportasi',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Belanja',
  'Pendapatan',
  'Lainnya',
]

export default function AddTransactionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Scanner states
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    category: 'Makanan' as TransactionCategory,
    description: '',
    date: getToday(),
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Simulated OCR receipt scanning
  const handleScanNota = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsScanning(true)
    setError(null)
    setScanSuccess(null)

    // Simulate AI parsing after 2.5s
    setTimeout(() => {
      setIsScanning(false)
      
      // Typical mock receipt items
      const mockAmount = 145000
      const mockCategory = 'Belanja' as TransactionCategory
      const mockDescription = 'Belanja Bulanan Swalayan'
      
      setFormData({
        type: 'EXPENSE',
        amount: String(mockAmount),
        category: mockCategory,
        description: mockDescription,
        date: getToday(),
      })

      setScanSuccess('✓ Nota berhasil dipindai! Nilai Rp 145.000 dimasukkan otomatis.')
    }, 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }

    if (!formData.description.trim()) {
      setError('Deskripsi tidak boleh kosong')
      return
    }

    setIsLoading(true)

    try {
      await addTransaction({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        createdAt: Date.now(),
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan transaksi'
      setError(message)
      console.error('Error adding transaction:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <Header title="Catat Transaksi Manual" subtitle="Tambahkan data transaksi secara mandiri" />

      {/* Inject Keyframe Animation dynamically */}
      <style>{`
        @keyframes scanLaser {
          0%, 100% { top: 0%; }
          50% { top: 96%; }
        }
        .animate-laser {
          animation: scanLaser 2s linear infinite;
        }
      `}</style>

      <div className="px-4 py-6 md:px-0 max-w-2xl mx-auto">
        <Card className="border border-slate-100/80 shadow-md bg-white rounded-3xl overflow-hidden relative">
          
          {/* Laser Scanning Screen Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white rounded-3xl overflow-hidden animate-in fade-in duration-200">
              <div className="relative w-36 h-36 border-2 border-emerald-500 rounded-3xl flex items-center justify-center overflow-hidden bg-slate-800/40 shadow-inner">
                {/* Scanner Laser */}
                <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-laser z-10" />
                <Camera className="w-12 h-12 text-emerald-400 opacity-60 animate-pulse" />
              </div>
              <p className="text-sm font-bold mt-4 tracking-wide text-emerald-400">Memindai Nota Belanja...</p>
              <p className="text-[10px] text-slate-300 mt-1">AI sedang menganalisis nominal & kategori kuitansi</p>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Tambah Transaksi Baru</CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Scan receipt widget */}
            <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-100/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-emerald-800">Scan Nota Belanja</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Membaca nota otomatis via kamera HP</p>
              </div>
              <div className="relative flex-shrink-0">
                <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm cursor-pointer select-none transition-all duration-200 hover:scale-105 active:scale-95">
                  <Camera className="w-4 h-4" />
                  Pindai Kuitansi
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleScanNota}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            {/* Scan Success Notice */}
            {scanSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-xs font-bold text-emerald-700">{scanSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Jenis Transaksi
                </label>
                <div className="flex gap-6">
                  {(['EXPENSE', 'INCOME'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label htmlFor="amount" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Jumlah (Rp)
                </label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="rounded-xl border-slate-200 font-extrabold focus:border-emerald-500"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kategori
                </label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 font-semibold text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Deskripsi
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Beli kopi starbucks, belanja indomaret, dll."
                  required
                  rows={3}
                  className="rounded-xl border-slate-200 font-medium"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label htmlFor="date" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal
                </label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 font-semibold"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Simpan Transaksi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1 border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
