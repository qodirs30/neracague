'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Trash2 } from 'lucide-react'
import { exportData, importData, clearAllTransactions, clearChatMessages } from '@/lib/db/indexeddb'

interface DataManagementProps {
  onImported?: () => void;
}

export function DataManagement({ onImported }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExport = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const data = await exportData()

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `neracague-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: 'Data berhasil diunduh',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal mengunduh data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setMessage(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate structure
      if (typeof data !== 'object' || (!data.transactions && !data.chatMessages)) {
        throw new Error('Format file tidak valid')
      }

      const result = await importData(data)
      setMessage({
        type: 'success',
        text: `${result.imported} data berhasil diimpor`,
      })
      onImported?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal mengimpor data',
      })
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await clearAllTransactions()
      await clearChatMessages()
      setMessage({
        type: 'success',
        text: 'Semua data telah dihapus',
      })
      onImported?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal menghapus data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Data</CardTitle>
        <CardDescription>Ekspor, impor, atau hapus data Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-2">Ekspor Data</h3>
          <p className="text-xs text-slate-500 mb-3">
            Unduh semua transaksi dan pesan chat sebagai file JSON untuk backup.
          </p>
          <Button
            onClick={handleExport}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh Backup
          </Button>
        </div>

        <div className="border-t" />

        {/* Import Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-2">Impor Data</h3>
          <p className="text-xs text-slate-500 mb-3">
            Pilih file JSON dari backup sebelumnya untuk mengembalikan data.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isLoading}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Pilih File untuk Diimpor
          </Button>
        </div>

        <div className="border-t" />

        {/* Clear All Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-2">Hapus Semua Data</h3>
          <p className="text-xs text-slate-500 mb-3">
            Hapus semua transaksi dan pesan chat secara permanen. Tidak dapat dibatalkan.
          </p>
          <Button
            onClick={handleClearAll}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Semua Data
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
