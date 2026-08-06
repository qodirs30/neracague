'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { Charts, CategoryDonut } from '@/components/dashboard/charts'
import { TransactionList } from '@/components/dashboard/transaction-list'
import { ActivityBubble } from '@/components/dashboard/activity-bubble'
import { GoalsProgress } from '@/components/dashboard/goals-progress'
import { 
  getAllTransactions, 
  getMonthlyStats, 
  getCategoryBreakdown,
  deleteTransaction,
  updateTransaction 
} from '@/lib/db/indexeddb'
import { getMonthStart, getMonthEnd, formatMonth } from '@/lib/utils-extended'
import type { Transaction } from '@/types/transaction'

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
  balance: number;
  cumulative: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profileName, setProfileName] = useState('Sobat Neracague')
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  })
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])

  // Helper to recalculate goal progress milestones
  const checkMilestones = (allTxs: Transaction[]) => {
    const savedGoals = localStorage.getItem('neracague_goals')
    if (savedGoals) {
      try {
        const goals = JSON.parse(savedGoals)
        const completed: string[] = []
        for (const g of goals) {
          const current = allTxs
            .filter((t) => {
              const descMatch = t.description?.toLowerCase().includes(g.keyword.toLowerCase())
              const catMatch = t.category?.toLowerCase().includes(g.keyword.toLowerCase())
              return descMatch || catMatch
            })
            .reduce((sum, t) => sum + t.amount, 0)
          
          if (current >= g.targetAmount) {
            completed.push(g.title)
          }
        }
        setAchievedMilestones(completed)
      } catch (e) {
        console.error(e)
      }
    }
  }

  // Load data from IndexedDB
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const savedName = localStorage.getItem('profileName')
        if (savedName) {
          setProfileName(savedName)
        }

        const allTransactions = await getAllTransactions()
        setTransactions(allTransactions.reverse())

        const today = new Date().toISOString().split('T')[0]
        const stats = await getMonthlyStats(today)
        setMonthlyStats(stats)

        const categories = await getCategoryBreakdown()
        setCategoryData(
          categories.map((cat) => ({
            name: cat.category,
            value: cat.amount,
          }))
        )

        let cumulative = 0
        const monthlyData: MonthlyData[] = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const dateString = date.toISOString().split('T')[0]

          const monthStats = await getMonthlyStats(dateString)
          const net = monthStats.income - monthStats.expense
          cumulative += net
          monthlyData.push({
            name: formatMonth(dateString),
            income: monthStats.income,
            expense: monthStats.expense,
            balance: net,
            cumulative: cumulative,
          })
        }
        setMonthlyChartData(monthlyData)
        checkMilestones(allTransactions)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle transaction delete
  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id)
      const updatedTxs = transactions.filter((t) => t.id !== id)
      setTransactions(updatedTxs)
      
      const today = new Date().toISOString().split('T')[0]
      const stats = await getMonthlyStats(today)
      setMonthlyStats(stats)

      const categories = await getCategoryBreakdown()
      setCategoryData(
        categories.map((cat) => ({
          name: cat.category,
          value: cat.amount,
        }))
      )

      checkMilestones(updatedTxs)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  // Handle transaction update
  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateTransaction(id, updates)
      
      const allTransactions = await getAllTransactions()
      setTransactions(allTransactions.reverse())

      const today = new Date().toISOString().split('T')[0]
      const stats = await getMonthlyStats(today)
      setMonthlyStats(stats)

      const categories = await getCategoryBreakdown()
      setCategoryData(
        categories.map((cat) => ({
          name: cat.category,
          value: cat.amount,
        }))
      )

      let cumulative = 0
      const monthlyData: MonthlyData[] = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const dateString = date.toISOString().split('T')[0]

        const monthStats = await getMonthlyStats(dateString)
        const net = monthStats.income - monthStats.expense
        cumulative += net
        monthlyData.push({
          name: formatMonth(dateString),
          income: monthStats.income,
          expense: monthStats.expense,
          balance: net,
          cumulative: cumulative,
        })
      }
      setMonthlyChartData(monthlyData)
      checkMilestones(allTransactions)
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  return (
    <MainLayout>
      {/* Mobile-only Header */}
      <div className="md:hidden mb-6">
        <Header 
          title={`Hi, ${profileName}`}
          subtitle="Berikut adalah ringkasan aktivitas keuangan pribadi Anda."
        />
      </div>

      {/* Target Belanja Achievements Banner Notification */}
      {achievedMilestones.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-xs font-bold text-emerald-900">Target Belanja Tercapai!</p>
              <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                Selamat! Kamu telah mencapai target untuk: <span className="font-extrabold text-emerald-900">{achievedMilestones.join(', ')}</span>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setAchievedMilestones([])}
            className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold px-3 py-1.5 hover:bg-emerald-100/50 rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Bento Grid 4-Column Layout on Desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Columns (3-columns width on xl screens) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Row 1: Summary Cards */}
          <SummaryCards
            income={monthlyStats.income}
            expense={monthlyStats.expense}
            balance={monthlyStats.balance}
            transactions={transactions}
            isLoading={isLoading}
          />

          {/* Row 2: Cashflow Flow AreaChart */}
          <Charts
            monthlyData={monthlyChartData}
            isLoading={isLoading}
          />

          {/* Row 3: Allocation Donut & Transaction List side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryDonut
              categoryData={categoryData}
              isLoading={isLoading}
            />
            <TransactionList
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onUpdate={handleUpdateTransaction}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right Column (1-column width on xl screens) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Overlapping Floating Bubble Chart */}
          <ActivityBubble
            transactions={transactions}
            isLoading={isLoading}
          />

          {/* Goals Circular Progress List */}
          <GoalsProgress
            transactions={transactions}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  )
}
