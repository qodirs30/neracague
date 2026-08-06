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
      <Header title="Catat Transaksi Manual" />

      <div className="px-4 py-6 md:px-0 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Transaksi Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Jenis Transaksi
                </label>
                <div className="flex gap-4">
                  {(['INCOME', 'EXPENSE'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700">
                        {type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-900 mb-2">
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
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-900 mb-2">
                  Kategori
                </label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-2">
                  Deskripsi
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Apa yang Anda beli atau dapatkan?"
                  required
                  rows={3}
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-900 mb-2">
                  Tanggal
                </label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1"
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
