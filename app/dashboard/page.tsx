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
  deleteTransaction 
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
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  })
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  // Load data from IndexedDB
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Get all transactions
        const allTransactions = await getAllTransactions()
        setTransactions(allTransactions.reverse())

        // Get current month stats
        const today = new Date().toISOString().split('T')[0]
        const stats = await getMonthlyStats(today)
        setMonthlyStats(stats)

        // Get category breakdown
        const categories = await getCategoryBreakdown()
        setCategoryData(
          categories.map((cat) => ({
            name: cat.category,
            value: cat.amount,
          }))
        )

        // Generate monthly data for chart (last 6 months)
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
      setTransactions(transactions.filter((t) => t.id !== id))
      
      // Refresh stats
      const today = new Date().toISOString().split('T')[0]
      const stats = await getMonthlyStats(today)
      setMonthlyStats(stats)

      // Refresh category breakdown
      const categories = await getCategoryBreakdown()
      setCategoryData(
          categories.map((cat) => ({
            name: cat.category,
            value: cat.amount,
          }))
      )
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  return (
    <MainLayout>
      {/* Mobile-only Header */}
      <div className="md:hidden mb-6">
        <Header 
          title="Dashboard Keuangan"
          subtitle="Pantau keuangan Anda dengan mudah"
        />
      </div>

      {/* Bento Grid 4-Column Layout on Desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Columns (3-columns width on xl screens) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Row 1: Summary Cards */}
          <SummaryCards
            income={monthlyStats.income}
            expense={monthlyStats.expense}
            balance={monthlyStats.balance}
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
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right Column (1-column width on xl screens) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Overlapping Floating Bubble Chart */}
          <ActivityBubble
            categoryData={categoryData}
            isLoading={isLoading}
          />

          {/* Goals Circular Progress List */}
          <GoalsProgress
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  )
}
