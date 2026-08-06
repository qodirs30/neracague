'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency, getCategoryColor } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface ActivityBubbleProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function ActivityBubble({ transactions = [], isLoading }: ActivityBubbleProps) {
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

  // 1. Group and sum transactions by category
  const categorySums: { 
    [key: string]: { name: string; amount: number; type: 'INCOME' | 'EXPENSE' } 
  } = {}

  for (const t of transactions) {
    const cat = t.category || 'Lainnya'
    if (!categorySums[cat]) {
      categorySums[cat] = {
        name: cat,
        amount: 0,
        type: t.type,
      }
    }
    categorySums[cat].amount += t.amount
  }

  const activeBubbles = Object.values(categorySums).sort((a, b) => b.amount - a.amount)

  // Fallback to mock bubbles if no data exists
  const bubblesToRender = activeBubbles.length > 0 ? activeBubbles : [
    { name: 'Pendapatan', amount: 5000000, type: 'INCOME' as const },
    { name: 'Makanan', amount: 1250000, type: 'EXPENSE' as const },
    { name: 'Belanja', amount: 850000, type: 'EXPENSE' as const },
    { name: 'Tagihan', amount: 450000, type: 'EXPENSE' as const },
    { name: 'Transportasi', amount: 200000, type: 'EXPENSE' as const },
  ]

  // Find max amount to scale sizes
  const maxAmount = Math.max(...bubblesToRender.map(b => b.amount))

  // Pre-configured layout coordinates (percentages) to distribute bubbles nicely
  const coordinates = [
    { left: '8%', top: '15%', anim: 'float-1' },
    { left: '50%', top: '48%', anim: 'float-2' },
    { left: '60%', top: '8%', anim: 'float-3' },
    { left: '12%', top: '55%', anim: 'float-4' },
    { left: '38%', top: '10%', anim: 'float-1' },
    { left: '72%', top: '50%', anim: 'float-2' },
  ]

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[330px] flex flex-col justify-between overflow-hidden relative">
      {/* Inline styles for custom floating animations */}
      <style>{`
        @keyframes float-1 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-7px) translateX(3px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes float-2 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(6px) translateX(-4px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes float-3 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-4px) translateX(-5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes float-4 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(5px) translateX(5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        .anim-float-1 { animation: float-1 5.5s ease-in-out infinite; }
        .anim-float-2 { animation: float-2 6.5s ease-in-out infinite; }
        .anim-float-3 { animation: float-3 4.8s ease-in-out infinite; }
        .anim-float-4 { animation: float-4 7s ease-in-out infinite; }
      `}</style>

      <CardHeader className="pb-1 pt-6 px-6 relative z-10 bg-white/80 backdrop-blur-sm">
        <CardTitle className="text-base font-bold text-slate-800">Aktivitas Neraca (Bubbles)</CardTitle>
        <CardDescription className="text-[10px] text-slate-400">
          Warna gelembung diselaraskan dengan alokasi dana dan kategori neraca.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 relative overflow-hidden bg-slate-50/30 min-h-[220px]">
        {/* Render Floating Bubbles */}
        {bubblesToRender.map((b, idx) => {
          const coord = coordinates[idx % coordinates.length]
          
          // Calculate diameter: 58px to 105px range
          const size = 58 + (b.amount / maxAmount) * 47
          const bubbleColor = getCategoryColor(b.name)
          
          return (
            <div 
              key={idx}
              className={`absolute rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg transition-transform duration-300 hover:scale-110 select-none border border-white/20 text-white cursor-default z-10 ${coord.anim === 'float-1' ? 'anim-float-1' : coord.anim === 'float-2' ? 'anim-float-2' : coord.anim === 'float-3' ? 'anim-float-3' : 'anim-float-4'}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: coord.left,
                top: coord.top,
                backgroundColor: bubbleColor,
              }}
            >
              <span className="text-[8px] font-bold opacity-85 uppercase tracking-wider truncate max-w-full">
                {b.name}
              </span>
              <span className="text-[10px] font-extrabold mt-0.5 tracking-tight truncate max-w-full">
                {formatCurrency(b.amount)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
