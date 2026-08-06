'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { DataManagement } from '@/components/settings/data-management'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SettingsPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [profileName, setProfileName] = useState('Sobat Neracague')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('profileName')
      if (savedName) {
        setProfileName(savedName)
      }
    }
  }, [])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('profileName', profileName)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleImported = () => {
    // Refresh the page or component as needed
    setRefreshKey((prev) => prev + 1)
    // Optionally navigate back to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
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
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Masukkan nama Anda..."
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {isSaved ? '✓ Profil Berhasil Disimpan' : 'Simpan Perubahan'}
              </button>
            </form>
          </CardContent>
        </Card>
        {/* About Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Image
              src="/logo.png"
              alt="neracague Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain rounded-xl"
            />
            <div>
              <CardTitle>Tentang neracague</CardTitle>
              <CardDescription>Informasi aplikasi</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Versi</p>
              <p className="text-sm text-slate-600">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">AI Assistant</p>
              <p className="text-sm text-slate-600">biji kipli (Gemini powered)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Penyimpanan Data</p>
              <p className="text-sm text-slate-600">IndexedDB (Client-side)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Mode Offline</p>
              <p className="text-sm text-slate-600">Didukung penuh</p>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fitur</CardTitle>
            <CardDescription>Apa saja yang bisa Anda lakukan</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Catat transaksi manual dengan kategori lengkap</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Chat dengan biji kipli untuk parsing transaksi otomatis</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Visualisasi data dengan chart interaktif</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Analisis pengeluaran per kategori</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Backup dan restore data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Berfungsi offline untuk catatan manual</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Management */}
        <DataManagement key={refreshKey} onImported={handleImported} />

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Trik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-900 mb-1">Chat dengan biji kipli</p>
              <p>Cukup katakan apa yang Anda beli dalam bahasa alami, misalnya: &quot;Habis beli nasi goreng 25rb sama es teh 5rb di warung&quot;</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 mb-1">Backup teratur</p>
              <p>Gunakan fitur ekspor secara berkala untuk memastikan data Anda aman.</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 mb-1">Kategori standar</p>
              <p>Gunakan kategori yang disediakan untuk hasil analisis yang lebih akurat dari biji kipli.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
