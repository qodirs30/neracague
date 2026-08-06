'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoreHorizontal, Check, X } from 'lucide-react'

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
  const [isEditing, setIsEditing] = useState(false)
  
  // Dynamic goals state
  const [goal1Title, setGoal1Title] = useState('Investasi Saham')
  const [goal1Percent, setGoal1Percent] = useState(80)
  const [goal2Title, setGoal2Title] = useState('Tabungan Darurat')
  const [goal2Percent, setGoal2Percent] = useState(65)

  // Temporary edit states
  const [tempG1Title, setTempG1Title] = useState('')
  const [tempG1Percent, setTempG1Percent] = useState(80)
  const [tempG2Title, setTempG2Title] = useState('')
  const [tempG2Percent, setTempG2Percent] = useState(65)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const g1t = localStorage.getItem('goal1_title')
      const g1p = localStorage.getItem('goal1_percent')
      const g2t = localStorage.getItem('goal2_title')
      const g2p = localStorage.getItem('goal2_percent')
      
      if (g1t) setGoal1Title(g1t)
      if (g1p) setGoal1Percent(Number(g1p))
      if (g2t) setGoal2Title(g2t)
      if (g2p) setGoal2Percent(Number(g2p))
    }
  }, [])

  // Start editing mode
  const startEdit = () => {
    setTempG1Title(goal1Title)
    setTempG1Percent(goal1Percent)
    setTempG2Title(goal2Title)
    setTempG2Percent(goal2Percent)
    setIsEditing(true)
  }

  // Save changes
  const saveChanges = () => {
    setGoal1Title(tempG1Title)
    setGoal1Percent(tempG1Percent)
    setGoal2Title(tempG2Title)
    setGoal2Percent(tempG2Percent)
    
    localStorage.setItem('goal1_title', tempG1Title)
    localStorage.setItem('goal1_percent', String(tempG1Percent))
    localStorage.setItem('goal2_title', tempG2Title)
    localStorage.setItem('goal2_percent', String(tempG2Percent))
    
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[260px]">
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
      title: goal1Title,
      category: 'Target Keuangan',
      percentage: goal1Percent,
      color: 'stroke-indigo-650 stroke-[#3E6BEC]',
      trailColor: 'stroke-indigo-50',
    },
    {
      title: goal2Title,
      category: 'Anggaran Aman',
      percentage: goal2Percent,
      color: 'stroke-rose-500',
      trailColor: 'stroke-rose-50',
    },
  ]

  const radius = 18
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl min-h-[260px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Target Belanja</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">
            {isEditing ? 'Ubah parameter target' : 'Sasaran pengelolaan dana Anda'}
          </CardDescription>
        </div>
        {!isEditing && (
          <button 
            onClick={startEdit}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center px-6 pb-6 pt-0">
        {isEditing ? (
          /* Settings Edit Form */
          <div className="space-y-3.5 my-auto">
            {/* Goal 1 Edit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <input 
                  type="text" 
                  value={tempG1Title}
                  onChange={(e) => setTempG1Title(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 w-2/3 focus:outline-none focus:border-indigo-500"
                  placeholder="Target 1..."
                />
                <div className="flex items-center gap-1 w-1/3 justify-end">
                  <input 
                    type="number" 
                    value={tempG1Percent}
                    onChange={(e) => setTempG1Percent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-800 w-12 text-center focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Goal 2 Edit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <input 
                  type="text" 
                  value={tempG2Title}
                  onChange={(e) => setTempG2Title(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 w-2/3 focus:outline-none focus:border-rose-500"
                  placeholder="Target 2..."
                />
                <div className="flex items-center gap-1 w-1/3 justify-end">
                  <input 
                    type="number" 
                    value={tempG2Percent}
                    onChange={(e) => setTempG2Percent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-800 w-12 text-center focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={saveChanges}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Simpan
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" /> Batal
              </button>
            </div>
          </div>
        ) : (
          /* Normal Display Mode */
          <div className="flex flex-col gap-3.5 justify-center flex-1">
            {goals.map((goal) => {
              const strokeDashoffset = circumference - (goal.percentage / 100) * circumference
              return (
                <div 
                  key={goal.title}
                  className="flex items-center justify-between p-2.5 border border-slate-50 rounded-2xl hover:bg-slate-50/50 transition-colors duration-150"
                >
                  <div className="truncate max-w-[150px]">
                    <p className="text-xs font-bold text-slate-800 truncate">{goal.title}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{goal.category}</p>
                  </div>
                  
                  {/* Circular SVG Progress */}
                  <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Trail */}
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        className={`fill-none stroke-2 ${goal.trailColor}`}
                      />
                      {/* Progress Line */}
                      <circle
                        cx="22"
                        cy="22"
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
