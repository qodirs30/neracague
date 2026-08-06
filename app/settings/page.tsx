'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { DataManagement } from '@/components/settings/data-management'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getAllTransactions } from '@/lib/db/indexeddb'
import { formatCurrency } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'
import { Download, FileText, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [profileName, setProfileName] = useState('Sobat Neracague')
  const [isSaved, setIsSaved] = useState(false)
  
  // Financial Insights State
  const [insights, setInsights] = useState<string[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('profileName')
      if (savedName) {
        setProfileName(savedName)
      }
    }
  }, [])

  // Calculate dynamic monthly insights
  useEffect(() => {
    getAllTransactions().then((txs) => {
      setTotalTransactions(txs.length)
      if (txs.length === 0) return

      const today = new Date()
      const thisMonth = today.getMonth()
      const thisYear = today.getFullYear()
      
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

      // Filter expenses
      const expenses = txs.filter(t => t.type === 'EXPENSE')
      
      const thisMonthExpenses = expenses.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })

      const lastMonthExpenses = expenses.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })

      const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
      const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0)

      const generatedInsights: string[] = []

      if (lastMonthTotal > 0) {
        const pctDiff = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        if (pctDiff > 0) {
          generatedInsights.push(`Total pengeluaran bulan ini naik ${pctDiff.toFixed(1)}% dibanding bulan lalu. 📈`)
        } else {
          generatedInsights.push(`Total pengeluaran bulan ini turun ${Math.abs(pctDiff).toFixed(1)}% dibanding bulan lalu. 🎉`)
        }
      } else {
        generatedInsights.push(`Catat transaksi bulan ini untuk membandingkan performa dengan bulan lalu.`)
      }

      // Check food category specifically
      const getCatTotal = (list: Transaction[], cat: string) => 
        list.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
      
      const thisMonthFood = getCatTotal(thisMonthExpenses, 'Makanan')
      const lastMonthFood = getCatTotal(lastMonthExpenses, 'Makanan')
      
      if (lastMonthFood > 0) {
        const foodDiff = ((thisMonthFood - lastMonthFood) / lastMonthFood) * 100
        if (foodDiff > 10) {
          generatedInsights.push(`Biaya Makanan naik ${foodDiff.toFixed(1)}% bulan ini. Disarankan kurangi jajan di luar! 🍔`)
        }
      }

      setInsights(generatedInsights)
    }).catch(err => console.error(err))
  }, [refreshKey])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('profileName', profileName)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleImported = () => {
    setRefreshKey((prev) => prev + 1)
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  const handleExportCSV = async () => {
    try {
      const txs = await getAllTransactions()
      if (txs.length === 0) {
        alert("Tidak ada transaksi untuk diekspor.")
        return
      }

      // Generate CSV format with UTF-8 BOM
      const headers = ['ID', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Nominal']
      const rows = txs.map((t) => [
        t.id,
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
        t.amount,
      ])

      const csvContent = 
        '\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `laporan_neracague_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error(err)
      alert("Gagal mengekspor data.")
    }
  }

  return (
    <MainLayout>
      <Header title="Pengaturan" subtitle="Kelola data dan preferensi Anda" />

      <div className="px-4 py-6 md:px-0 max-w-2xl mx-auto space-y-6">
        {/* User Profile Card */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Profil Pengguna</CardTitle>
            <CardDescription className="text-xs text-slate-400">Atur nama panggilan Anda untuk disapa di dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Anda</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3E6BEC]/20 focus:border-[#3E6BEC] transition-all"
                  placeholder="Masukkan nama Anda..."
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3E6BEC] hover:bg-[#2563eb] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {isSaved ? '✓ Profil Berhasil Disimpan' : 'Simpan Perubahan'}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* NEW: REPORT & EXPORT SECTION */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 stroke-[2.3]" /> Laporan & Ekspor Data
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Unduh data transaksi atau tinjau kesehatan finansial Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4.5">
            {/* Financial Health Insights */}
            <div className="p-4.5 bg-indigo-50/40 border border-indigo-100/30 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#3E6BEC]" /> Evaluasi Keuangan Bulanan
              </h4>
              {insights.length > 0 ? (
                <ul className="space-y-1.5">
                  {insights.map((ins, idx) => (
                    <li key={idx} className="text-xs font-semibold text-slate-650 text-slate-700 leading-normal flex items-start gap-2">
                      <span className="text-[#3E6BEC] font-bold select-none">•</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-semibold text-slate-400">Belum ada mutasi yang cukup untuk dianalisis bulan ini.</p>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> Unduh Laporan Mutasi (CSV)
            </button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-6 px-6">
            <Image
              src="/logo.png"
              alt="neracague Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain rounded-2xl border border-slate-100/50 shadow-sm"
            />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Tentang neracague</CardTitle>
              <CardDescription className="text-xs text-slate-400">Informasi aplikasi & pengembang</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 px-6 pb-6 border-t border-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">Versi</p>
                <p className="text-xs font-extrabold text-slate-750 text-slate-700 mt-0.5">1.0.0</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">AI Assistant</p>
                <p className="text-xs font-extrabold text-slate-750 text-slate-700 mt-0.5">biji kipli (Gemini 3.6)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">Penyimpanan</p>
                <p className="text-xs font-extrabold text-slate-750 text-slate-700 mt-0.5">IndexedDB & Local</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">Pengembang</p>
                <p className="text-xs font-extrabold text-[#3E6BEC] mt-0.5">qodirs_</p>
              </div>
            </div>

            {/* Developer Instagram Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hubungi Developer:</span>
              <a 
                href="https://www.instagram.com/qodirs_/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-[#E1306C] bg-[#E1306C]/10 border border-[#E1306C]/10 hover:bg-[#E1306C]/15 px-3 py-1.5 rounded-full transition-all cursor-pointer scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                <span>@qodirs_</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Daftar Fitur</CardTitle>
            <CardDescription className="text-xs text-slate-400">Daftar kapabilitas neracague</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-slate-650 text-slate-700 font-semibold">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>Pencatatan mutasi manual lengkap dengan auto-scanner nota kuitansi</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>Ekstraksi multi-transaksi otomatis lewat asisten AI biji kipli</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>Visualisasi chart bento-grid, glow spline, dan CryptoBubbles dynamic scale</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>Target belanja dinamis dengan deteksi otomatis deskripsi mutasi</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>Modul manajemen utang & cicilan terintegrasi</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Management */}
        <DataManagement key={refreshKey} onImported={handleImported} />
      </div>
    </MainLayout>
  )
}
