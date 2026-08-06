'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoreHorizontal } from 'lucide-react'

interface GoalItem {
  title: string;
  category: string;
  percentage: number;
  color: string;
  trailColor: string;
}

interface GoalsProgressProps {
  isLoading?: boolean;
}

export function GoalsProgress({ isLoading }: GoalsProgressProps) {
  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[240px]">
        <CardHeader className="pb-2">
          <CardTitle className="h-5 bg-slate-100 rounded w-24 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const goals: GoalItem[] = [
    {
      title: 'Investasi Saham',
      category: 'Target Keuangan',
      percentage: 80,
      color: 'stroke-indigo-650 stroke-[#3E6BEC]',
      trailColor: 'stroke-indigo-50',
    },
    {
      title: 'Tabungan Darurat',
      category: 'Anggaran Aman',
      percentage: 65,
      color: 'stroke-rose-500',
      trailColor: 'stroke-rose-50',
    },
  ]

  const radius = 18
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[240px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Target Belanja</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Sasaran pengelolaan dana Anda</CardDescription>
        </div>
        <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center gap-4 px-6 pb-6 pt-0">
        {goals.map((goal) => {
          const strokeDashoffset = circumference - (goal.percentage / 100) * circumference
          return (
            <div 
              key={goal.title}
              className="flex items-center justify-between p-3 border border-slate-50 rounded-2xl hover:bg-slate-50/50 transition-colors duration-150"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{goal.title}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{goal.category}</p>
              </div>
              
              {/* Circular SVG Progress */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Trail */}
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className={`fill-none stroke-2 ${goal.trailColor}`}
                  />
                  {/* Progress Line */}
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className={`fill-none stroke-2 transition-all duration-500 ease-out ${goal.color}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[9px] font-extrabold text-slate-700">
                  {goal.percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
