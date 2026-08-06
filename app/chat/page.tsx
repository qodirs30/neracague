'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { MainLayout } from '@/components/layout/main-layout'
import { ChatWindow } from '@/components/chat/chat-window'
import {
  addChatMessage,
  getChatMessages,
  addTransaction,
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

      // Handle transaction extraction
      let extractedTransaction: AiExtractedTransaction | undefined

      // Try to extract from API response first, fallback to client-side extraction
      let transaction = data.transaction
      if (!transaction) {
        // Fallback: try client-side extraction from user message
        const clientExtracted = extractTransactionFromUserMessage(userMessage)
        if (clientExtracted) {
          transaction = clientExtracted as AiExtractedTransaction
        }
      }

      if (transaction) {
        // Add transaction to IndexedDB
        const today = new Date().toISOString().split('T')[0]
        await addTransaction({
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          type: transaction.type,
          date: today,
          createdAt: Date.now(),
        })
        extractedTransaction = transaction
      }

      // Add assistant message
      const assistantMessageId = generateId()
      const assistantChatMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: data.text,
        createdAt: Date.now(),
        extractedTransaction,
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
      <Header title="Chat dengan biji kipli" subtitle="Ceritakan transaksi Anda" />

      <div className="px-4 py-6 md:px-0 h-[calc(100vh-120px)] md:h-[calc(100vh-200px)]">
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
