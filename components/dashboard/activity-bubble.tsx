'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoreHorizontal, X, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-extended'

interface CategoryItem {
  name: string;
  value: number;
}

interface ActivityBubbleProps {
  categoryData?: CategoryItem[];
  isLoading?: boolean;
}

const COLOR_PALETTE = [
  { name: 'Blue', value: '#3b82f6', bgClass: 'bg-[#3b82f6]', hoverBgClass: 'hover:bg-[#2563eb]', shadow: 'shadow-blue-500/10' },
  { name: 'Yellow', value: '#f59e0b', bgClass: 'bg-[#f59e0b]', hoverBgClass: 'hover:bg-[#d97706]', shadow: 'shadow-amber-500/10' },
  { name: 'Pink', value: '#ec4899', bgClass: 'bg-[#ec4899]', hoverBgClass: 'hover:bg-[#db2777]', shadow: 'shadow-pink-500/10' },
  { name: 'Emerald', value: '#10b981', bgClass: 'bg-[#10b981]', hoverBgClass: 'hover:bg-[#059669]', shadow: 'shadow-emerald-500/10' },
  { name: 'Violet', value: '#8b5cf6', bgClass: 'bg-[#8b5cf6]', hoverBgClass: 'hover:bg-[#7c3aed]', shadow: 'shadow-violet-500/10' },
  { name: 'Orange', value: '#f97316', bgClass: 'bg-[#f97316]', hoverBgClass: 'hover:bg-[#ea580c]', shadow: 'shadow-orange-500/10' },
]

export function ActivityBubble({ categoryData = [], isLoading }: ActivityBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  // Custom bubble colors state (holds values from COLOR_PALETTE)
  const [color1, setColor1] = useState('#3b82f6')
  const [color2, setColor2] = useState('#f59e0b')
  const [color3, setColor3] = useState('#ec4899')

  // Load colors from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const c1 = localStorage.getItem('bubble_color1')
      const c2 = localStorage.getItem('bubble_color2')
      const c3 = localStorage.getItem('bubble_color3')
      if (c1) setColor1(c1)
      if (c2) setColor2(c2)
      if (c3) setColor3(c3)
    }
  }, [])

  const saveColor = (bubbleIndex: number, colorValue: string) => {
    if (bubbleIndex === 1) {
      setColor1(colorValue)
      localStorage.setItem('bubble_color1', colorValue)
    } else if (bubbleIndex === 2) {
      setColor2(colorValue)
      localStorage.setItem('bubble_color2', colorValue)
    } else if (bubbleIndex === 3) {
      setColor3(colorValue)
      localStorage.setItem('bubble_color3', colorValue)
    }
  }

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

  // Resolve active color configs
  const config1 = COLOR_PALETTE.find((c) => c.value === color1) || COLOR_PALETTE[0]
  const config2 = COLOR_PALETTE.find((c) => c.value === color2) || COLOR_PALETTE[1]
  const config3 = COLOR_PALETTE.find((c) => c.value === color3) || COLOR_PALETTE[2]

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[330px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Aktivitas Terbesar</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">
            {isEditing ? 'Ubah warna gelembung pengeluaran' : '3 pengeluaran tertinggi Anda'}
          </CardDescription>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isEditing 
              ? 'bg-slate-100 text-slate-700' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
          title="Ubah Warna"
        >
          {isEditing ? <X className="w-4 h-4 stroke-[2.5]" /> : <MoreHorizontal className="w-5 h-5" />}
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 relative flex items-center justify-center min-h-[220px] overflow-hidden px-6 pb-6 pt-0">
        {isEditing ? (
          /* EDIT COLOR PALETTE DIALOG */
          <div className="w-full space-y-4 my-auto">
            {/* Bubble 1 Color Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{top1.name} (Utama)</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color1 }} />
              </div>
              <div className="flex gap-2">
                {COLOR_PALETTE.map((pal) => (
                  <button
                    key={pal.value}
                    onClick={() => saveColor(1, pal.value)}
                    className={`w-6 h-6 rounded-full cursor-pointer border flex items-center justify-center ${pal.bgClass} ${
                      color1 === pal.value ? 'border-slate-800 ring-2 ring-slate-100 scale-110' : 'border-transparent'
                    }`}
                  >
                    {color1 === pal.value && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bubble 2 Color Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{top2.name} (Kedua)</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color2 }} />
              </div>
              <div className="flex gap-2">
                {COLOR_PALETTE.map((pal) => (
                  <button
                    key={pal.value}
                    onClick={() => saveColor(2, pal.value)}
                    className={`w-6 h-6 rounded-full cursor-pointer border flex items-center justify-center ${pal.bgClass} ${
                      color2 === pal.value ? 'border-slate-800 ring-2 ring-slate-100 scale-110' : 'border-transparent'
                    }`}
                  >
                    {color2 === pal.value && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bubble 3 Color Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{top3.name} (Ketiga)</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color3 }} />
              </div>
              <div className="flex gap-2">
                {COLOR_PALETTE.map((pal) => (
                  <button
                    key={pal.value}
                    onClick={() => saveColor(3, pal.value)}
                    className={`w-6 h-6 rounded-full cursor-pointer border flex items-center justify-center ${pal.bgClass} ${
                      color3 === pal.value ? 'border-slate-800 ring-2 ring-slate-100 scale-110' : 'border-transparent'
                    }`}
                  >
                    {color3 === pal.value && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* BUBBLE CHART DISPLAY MODE */
          <>
            {/* Bubble 1 (Largest) */}
            <div 
              style={{ backgroundColor: color1 }}
              className={`absolute left-6 top-6 w-32 h-32 rounded-full text-white flex flex-col items-center justify-center p-3 text-center shadow-lg border border-white/20 select-none animate-float-slow hover:scale-105 transition-all duration-300 z-20 ${config1.shadow}`}
            >
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
                {top1.name}
              </span>
              <span className="text-base font-extrabold mt-0.5 tracking-tight">
                {formatCurrency(top1.value)}
              </span>
            </div>

            {/* Bubble 2 (Medium) */}
            <div 
              style={{ backgroundColor: color2 }}
              className={`absolute right-6 bottom-4 w-26 h-26 rounded-full text-white flex flex-col items-center justify-center p-2.5 text-center shadow-lg border border-white/20 select-none animate-float-medium hover:scale-105 transition-all duration-300 z-10 ${config2.shadow}`}
            >
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
                {top2.name}
              </span>
              <span className="text-sm font-extrabold mt-0.5 tracking-tight">
                {formatCurrency(top2.value)}
              </span>
            </div>

            {/* Bubble 3 (Small) */}
            <div 
              style={{ backgroundColor: color3 }}
              className={`absolute right-10 top-10 w-22 h-22 rounded-full text-white flex flex-col items-center justify-center p-2 text-center shadow-lg border border-white/20 select-none animate-float-fast hover:scale-105 transition-all duration-300 z-30 ${config3.shadow}`}
            >
              <span className="text-[8px] font-bold text-white/80 uppercase tracking-wider truncate max-w-full">
                {top3.name}
              </span>
              <span className="text-xs font-extrabold mt-0.5 tracking-tight">
                {formatCurrency(top3.value)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
