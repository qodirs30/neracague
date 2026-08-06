'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { Charts } from '@/components/dashboard/charts'
import { TransactionList } from '@/components/dashboard/transaction-list'
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
        const monthlyData: MonthlyData[] = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const dateString = date.toISOString().split('T')[0]

          const monthStats = await getMonthlyStats(dateString)
          monthlyData.push({
            name: formatMonth(dateString),
            income: monthStats.income,
            expense: monthStats.expense,
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
    <MainLayout sidebar={undefined}>
      <Header 
        title="Dashboard Keuangan"
        subtitle="Pantau keuangan Anda dengan mudah"
      />

      <div className="px-4 py-6 space-y-6 md:px-0">
        {/* Summary Cards */}
        <SummaryCards
          income={monthlyStats.income}
          expense={monthlyStats.expense}
          balance={monthlyStats.balance}
          isLoading={isLoading}
        />

        {/* Charts */}
        <Charts
          monthlyData={monthlyChartData}
          categoryData={categoryData}
          isLoading={isLoading}
        />

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          onDelete={handleDeleteTransaction}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  )
}
