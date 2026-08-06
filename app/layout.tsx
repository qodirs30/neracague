import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PWARegistration } from '@/components/layout/pwa-registration'
import './globals.css'

export const metadata: Metadata = {
  title: 'neracague - Pencatat Keuangan Pribadi',
  description: 'Aplikasi pencatat keuangan pribadi dengan AI chatbot biji kipli. Catat transaksi, analisis pengeluaran, dan capai keuangan sehat.',
  keywords: ['keuangan', 'aplikasi', 'budget', 'pencatat', 'AI', 'chatbot'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'neracague - Pencatat Keuangan Pribadi',
    description: 'Aplikasi pencatat keuangan pribadi dengan AI chatbot biji kipli',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10B981' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-white">
      <body className="antialiased bg-white">
        <PWARegistration />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
