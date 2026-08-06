'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoreHorizontal } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-extended'

interface CategoryItem {
  name: string;
  value: number;
}

interface ActivityBubbleProps {
  categoryData?: CategoryItem[];
  isLoading?: boolean;
}

export function ActivityBubble({ categoryData = [], isLoading }: ActivityBubbleProps) {
  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[330px]">
        <CardHeader className="pb-2">
          <CardTitle className="h-5 bg-slate-100 rounded w-24 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-56">
          <div className="w-28 h-28 rounded-full bg-slate-50 animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Get top 3 categories, sorted by value descending
  const sortedCategories = [...categoryData].sort((a, b) => b.value - a.value)
  
  // Fallbacks if data is empty or incomplete
  const top1 = sortedCategories[0] || { name: 'Belanja', value: 2509000 }
  const top2 = sortedCategories[1] || { name: 'Makanan', value: 1250000 }
  const top3 = sortedCategories[2] || { name: 'Tagihan', value: 350000 }

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[330px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Aktivitas Terbesar</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">3 pengeluaran tertinggi Anda</CardDescription>
        </div>
        <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 relative flex items-center justify-center min-h-[220px] overflow-hidden">
        {/* Floating Bubble 1 (Blue - Largest) */}
        <div className="absolute left-6 top-6 w-32 h-32 rounded-full bg-[#3b82f6]/95 hover:bg-[#3b82f6] text-white flex flex-col items-center justify-center p-3 text-center shadow-lg shadow-blue-500/10 border border-white/20 select-none animate-float-slow hover:scale-105 transition-all duration-300 z-20">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
            {top1.name}
          </span>
          <span className="text-base font-extrabold mt-0.5 tracking-tight">
            {formatCurrency(top1.value)}
          </span>
        </div>

        {/* Floating Bubble 2 (Yellow - Medium) */}
        <div className="absolute right-6 bottom-4 w-26 h-26 rounded-full bg-[#f59e0b]/95 hover:bg-[#f59e0b] text-white flex flex-col items-center justify-center p-2.5 text-center shadow-lg shadow-amber-500/10 border border-white/20 select-none animate-float-medium hover:scale-105 transition-all duration-300 z-10">
          <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
            {top2.name}
          </span>
          <span className="text-sm font-extrabold mt-0.5 tracking-tight">
            {formatCurrency(top2.value)}
          </span>
        </div>

        {/* Floating Bubble 3 (Rose - Small) */}
        <div className="absolute right-10 top-10 w-22 h-22 rounded-full bg-[#ec4899]/95 hover:bg-[#ec4899] text-white flex flex-col items-center justify-center p-2 text-center shadow-lg shadow-pink-500/10 border border-white/20 select-none animate-float-fast hover:scale-105 transition-all duration-300 z-30">
          <span className="text-[8px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
            {top3.name}
          </span>
          <span className="text-xs font-extrabold mt-0.5 tracking-tight">
            {formatCurrency(top3.value)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
