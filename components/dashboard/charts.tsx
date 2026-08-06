'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
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
  categoryData?: ChartData[];
  isLoading?: boolean;
}

const COLORS = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316']

export function Charts({ monthlyData = [], categoryData = [], isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Monthly Income vs Expense */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pemasukan vs Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Belum ada data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) =>
                    `${name}: ${(percentage * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Belum ada data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
