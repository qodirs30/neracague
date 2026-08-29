'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { ChatWindow } from '@/components/chat/chat-window'
import {
  addChatMessage,
  getChatMessages,
  addTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
} from '@/lib/db/indexeddb'
import { generateId, extractTransactionFromUserMessage } from '@/lib/utils-extended'
import type { ChatMessage, AiResponsePayload } from '@/types/chat'
import type { AiExtractedTransaction } from '@/types/transaction'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelStatus, setModelStatus] = useState<'primary' | 'fallback'>('primary')
  const [pageIsLoading, setPageIsLoading] = useState(true)

  // Load chat history from IndexedDB
  useEffect(() => {
    async function loadMessages() {
      try {
        const savedMessages = await getChatMessages()
        setMessages(savedMessages)
      } catch (err) {
        console.error('Error loading messages:', err)
      } finally {
        setPageIsLoading(false)
      }
    }

    loadMessages()
  }, [])

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Add user message to chat
      const userMessageId = generateId()
      const userChatMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: userMessage,
        createdAt: Date.now(),
      }

      setMessages((prev) => [...prev, userChatMessage])
      await addChatMessage(userChatMessage)

      // Fetch all local transactions to provide context to Gemini
      const localTransactions = await getAllTransactions()

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage,
          transactions: localTransactions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data: AiResponsePayload = await response.json()

      // Set model status based on response
      setModelStatus(
        data.modelUsed === 'gemini-3.6-flash' ? 'primary' : 'fallback'
      )

      // Handle database action updates/deletes if returned
      if (data.actions && data.actions.length > 0) {
        for (const act of data.actions) {
          // Resolve original transaction fields (description/type) for visual display logs
          const original = localTransactions.find((t) => t.id === act.id)
          if (original) {
            if (act.description === undefined) act.description = original.description
            if (act.type === undefined) act.type = original.type
            if (act.category === undefined) act.category = original.category
          }

          if (act.action === 'UPDATE') {
            const updates: any = {}
            if (act.amount !== undefined) updates.amount = act.amount
            if (act.category !== undefined) updates.category = act.category
            if (act.description !== undefined) updates.description = act.description
            if (act.type !== undefined) updates.type = act.type
            if (act.date !== undefined) updates.date = act.date
            await updateTransaction(act.id, updates)
          } else if (act.action === 'DELETE') {
            await deleteTransaction(act.id)
          }
        }
      }

      // Handle transaction extraction (can be multiple)
      let extractedTransactions: AiExtractedTransaction[] = []

      // Try to extract from API response first, fallback to client-side extraction
      let transactionsList = data.transactions
      if (!transactionsList && data.transaction) {
        transactionsList = [data.transaction]
      }

      if (!transactionsList || transactionsList.length === 0) {
        // Fallback: try client-side extraction from user message
        const clientExtracted = extractTransactionFromUserMessage(userMessage)
        if (clientExtracted) {
          transactionsList = clientExtracted as AiExtractedTransaction[]
        }
      }

      if (transactionsList && transactionsList.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        for (const tx of transactionsList) {
          await addTransaction({
            amount: tx.amount,
            category: tx.category,
            description: tx.description,
            type: tx.type,
            date: tx.date || today,
            createdAt: Date.now(),
          })
        }
        extractedTransactions = transactionsList
      }

      // Add assistant message
      const assistantMessageId = generateId()
      const assistantChatMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: data.text,
        createdAt: Date.now(),
        extractedTransactions,
        actions: data.actions || undefined,
        modelUsed: data.modelUsed,
      }

      setMessages((prev) => [...prev, assistantChatMessage])
      await addChatMessage(assistantChatMessage)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (pageIsLoading) {
    return (
      <MainLayout>
        <Header title="Chat dengan biji kipli" />
        <div className="px-4 py-6 md:px-0">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Mobile-only Header */}
      <div className="md:hidden mb-4">
        <Header title="Chat dengan biji kipli" subtitle="Ceritakan transaksi Anda" />
      </div>

      {/* Social-style Full Viewport height Chat Box container */}
      <div className="h-[calc(100vh-170px)] sm:h-[calc(100vh-210px)] md:h-[calc(100vh-180px)] max-w-4xl mx-auto flex flex-col bg-white border border-slate-100/80 shadow-sm rounded-3xl overflow-hidden relative">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          modelStatus={modelStatus}
        />
      </div>
    </MainLayout>
  )
}
