'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoreHorizontal, Check, X, Trash2, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  keyword: string; // keyword to search in transactions
}

interface GoalsProgressProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function GoalsProgress({ transactions = [], isLoading }: GoalsProgressProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  
  // New goal input states
  const [newTitle, setNewTitle] = useState('')
  const [newTarget, setNewTarget] = useState('')

  // Load goals from localStorage or load defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoals = localStorage.getItem('neracague_goals')
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals))
        } catch (e) {
          console.error(e)
          loadDefaults()
        }
      } else {
        loadDefaults()
      }
    }
  }, [])

  const loadDefaults = () => {
    const defaultGoals: Goal[] = [
      {
        id: '1',
        title: 'Beli Saham',
        targetAmount: 5000000,
        keyword: 'saham',
      },
      {
        id: '2',
        title: 'Bitcoin',
        targetAmount: 2000000,
        keyword: 'bitcoin',
      },
      {
        id: '3',
        title: 'Tabungan Darurat',
        targetAmount: 10000000,
        keyword: 'darurat',
      }
    ]
    setGoals(defaultGoals)
    localStorage.setItem('neracague_goals', JSON.stringify(defaultGoals))
  }

  // Save goals list to localStorage
  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals)
    localStorage.setItem('neracague_goals', JSON.stringify(updatedGoals))
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newTarget.trim()) return

    const newGoal: Goal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTitle.trim(),
      targetAmount: Number(newTarget),
      keyword: newTitle.trim().toLowerCase(),
    }

    const updated = [...goals, newGoal]
    saveGoals(updated)
    setNewTitle('')
    setNewTarget('')
  }

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id)
    saveGoals(updated)
  }

  // Calculate current accumulation of a goal based on transaction keyword matches
  const getGoalAccumulation = (keyword: string): number => {
    const cleanKw = keyword.toLowerCase()
    return transactions
      .filter((t) => {
        const descMatch = t.description?.toLowerCase().includes(cleanKw)
        const catMatch = t.category?.toLowerCase().includes(cleanKw)
        return descMatch || catMatch
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl h-[280px]">
        <CardHeader className="pb-2">
          <CardTitle className="h-5 bg-slate-100 rounded w-24 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const radius = 16
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="border border-slate-100/80 shadow-sm bg-white rounded-3xl min-h-[280px] max-h-[360px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Target Belanja</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">
            {isEditing ? 'Kelola target tabungan Anda' : 'Sasaran pencatatan keuangan Anda'}
          </CardDescription>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isEditing 
              ? 'bg-slate-100 text-slate-700' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
          title="Ubah Target"
        >
          {isEditing ? <X className="w-4 h-4 stroke-[2.5]" /> : <MoreHorizontal className="w-5 h-5" />}
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between px-6 pb-6 pt-0 overflow-hidden">
        {isEditing ? (
          /* EDIT / MANAGE GOALS MODE */
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* Scrollable list of current goals to delete */}
            <div className="flex-1 overflow-y-auto max-h-[140px] pr-1 space-y-2">
              {goals.length > 0 ? (
                goals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <div className="truncate max-w-[150px]">
                      <p className="text-xs font-bold text-slate-800 truncate">{g.title}</p>
                      <p className="text-[9px] font-semibold text-slate-400">{formatCurrency(g.targetAmount)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] text-slate-400 py-4 font-semibold">Belum ada target</p>
              )}
            </div>

            {/* Form to Add New Goal */}
            <form onSubmit={handleAddGoal} className="border-t border-slate-100 pt-3 space-y-2 flex-shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 w-full focus:outline-none focus:border-emerald-500 focus:bg-white"
                  placeholder="Target (misal: Bitcoin)"
                  required
                />
                <input 
                  type="number" 
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 w-full focus:outline-none focus:border-emerald-500 focus:bg-white"
                  placeholder="Nominal (Rp)"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Tambah Target
              </button>
            </form>
          </div>
        ) : (
          /* DISPLAY MODE */
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-1 flex-1 py-1">
            {goals.length > 0 ? (
              goals.map((g) => {
                const current = getGoalAccumulation(g.keyword)
                const percent = Math.min(100, Math.round((current / g.targetAmount) * 100))
                const isCompleted = current >= g.targetAmount
                const strokeDashoffset = circumference - (percent / 100) * circumference

                return (
                  <div 
                    key={g.id}
                    className="flex items-center justify-between p-2.5 border border-slate-50 rounded-2xl hover:bg-slate-50/50 transition-all duration-200"
                  >
                    <div className="truncate max-w-[160px]">
                      <p className="text-xs font-bold text-slate-800 truncate">{g.title}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {formatCurrency(current)} / <span className="font-extrabold text-slate-500">{formatCurrency(g.targetAmount)}</span>
                      </p>
                    </div>
                    
                    {/* Ring Progress or Checkmark Icon */}
                    <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 animate-bounce-slow">
                          <Check className="w-5 h-5 stroke-[3.5]" />
                        </div>
                      ) : (
                        <>
                          <svg className="w-full h-full transform -rotate-90">
                            {/* Trail */}
                            <circle
                              cx="22"
                              cy="22"
                              r={radius}
                              className="fill-none stroke-2 stroke-slate-100"
                            />
                            {/* Progress Line */}
                            <circle
                              cx="22"
                              cy="22"
                              r={radius}
                              className={`fill-none stroke-2 transition-all duration-500 ease-out ${
                                percent > 50 ? 'stroke-[#3E6BEC]' : 'stroke-amber-500'
                              }`}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-extrabold text-slate-700">
                            {percent}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-xs font-semibold">Belum ada target dibuat.</p>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-xs text-emerald-600 font-bold hover:underline mt-1.5 cursor-pointer"
                >
                  Buat Target Baru
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
