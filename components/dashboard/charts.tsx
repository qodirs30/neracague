'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart,
  Bar,
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
  '#059669', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
]

// Custom Tooltip component for premium dark style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs font-sans space-y-1.5 backdrop-blur-md bg-opacity-95">
        <p className="font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-300">{item.name}:</span>
            </span>
            <span className="font-bold text-white">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// 1. Charts Component: renders Bar Chart and Area Chart side-by-side
export function Charts({ monthlyData = [], isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
              <CardDescription className="h-4 bg-slate-100 rounded w-32 mt-1.5 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-slate-50/50 rounded-xl animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Monthly Income vs Expense */}
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">Pemasukan vs Pengeluaran</CardTitle>
          <CardDescription className="text-xs text-slate-500">Perbandingan arus kas 6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.95}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.75}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.95}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.75}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  stroke="#e2e8f0"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                  stroke="#e2e8f0"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rp ${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#475569' }} 
                />
                <Bar dataKey="income" fill="url(#incomeGrad)" name="Pemasukan" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expense" fill="url(#expenseGrad)" name="Pengeluaran" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              Belum ada data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Area Chart - Cumulative Savings Growth (New) */}
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">Tren Saldo Akumulatif</CardTitle>
          <CardDescription className="text-xs text-slate-500">Pertumbuhan kekayaan & tabungan kumulatif</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  stroke="#e2e8f0"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                  stroke="#e2e8f0"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rp ${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                  name="Total Saldo"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              Belum ada data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="h-5 bg-slate-100 rounded w-48 animate-pulse" />
          <CardDescription className="h-4 bg-slate-100 rounded w-32 mt-1.5 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-slate-50/50 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const totalExpense = categoryData.reduce((acc, curr) => acc + (curr.value as number), 0)

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-2xl h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">Alokasi Pengeluaran</CardTitle>
        <CardDescription className="text-xs text-slate-500">Breakdown berdasarkan kategori transaksi</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 relative flex flex-col justify-center pb-6">
        {categoryData.length > 0 ? (
          <div className="relative w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
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
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text displaying total expense */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Keluar</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
            Belum ada data pengeluaran
          </div>
        )}
        
        {/* Custom Legend to match design rules */}
        {categoryData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
            {categoryData.slice(0, 6).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
            {categoryData.length > 6 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <span>+ {categoryData.length - 6} Lainnya</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
