'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils-extended'

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ChartsProps {
  monthlyData?: ChartData[];
  isLoading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#059669', // emerald
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
]

// Custom Tooltip for premium dark style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xl text-xs font-sans space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-300 font-semibold">{item.name}:</span>
            </span>
            <span className="font-extrabold text-white">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// 1. Charts Component: renders the main double AreaChart (Pemasukan vs Pengeluaran)
export function Charts({ monthlyData = [], isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[380px]">
        <CardHeader>
          <CardTitle className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
          <CardDescription className="h-4 bg-slate-100 rounded w-32 mt-1 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[280px] bg-slate-50/50 rounded-2xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl overflow-hidden h-[380px] flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-800">Tren Arus Kas</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Arus masuk dan keluar 6 bulan terakhir</CardDescription>
        </div>
        <div className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-xl select-none">
          6 Bulan terakhir
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 pt-0 flex-1 flex flex-col justify-end">
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                stroke="#e2e8f0"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                stroke="#e2e8f0"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rp ${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }} 
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#incomeGrad)" 
                name="Pemasukan" 
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#expenseGrad)" 
                name="Pengeluaran" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
            Belum ada data
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CategoryDonutProps {
  categoryData?: ChartData[];
  isLoading?: boolean;
}

// 2. CategoryDonut Component: renders a beautiful Donut Chart with total overlay
export function CategoryDonut({ categoryData = [], isLoading }: CategoryDonutProps) {
  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[380px]">
        <CardHeader>
          <CardTitle className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
          <CardDescription className="h-4 bg-slate-100 rounded w-32 mt-1.5 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[280px] bg-slate-50/50 rounded-2xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const totalExpense = categoryData.reduce((acc, curr) => acc + (curr.value as number), 0)

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[380px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-1 pt-6 px-6">
        <CardTitle className="text-base font-bold text-slate-800">Alokasi Dana</CardTitle>
        <CardDescription className="text-xs text-slate-400">Proporsi pengeluaran per kategori</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 relative flex flex-col justify-center pb-6">
        {categoryData.length > 0 ? (
          <div className="relative w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '10px 14px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text displaying total expense */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Keluar</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
            Belum ada data pengeluaran
          </div>
        )}
        
        {/* Custom Legend to match design rules */}
        {categoryData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2 max-h-[64px] overflow-y-auto">
            {categoryData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate max-w-[90px]">{entry.name}</span>
              </div>
            ))}
            {categoryData.length > 4 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span>+ {categoryData.length - 4} Lainnya</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
