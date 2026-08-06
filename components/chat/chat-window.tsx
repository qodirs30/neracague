'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { AlertCircle, Loader } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  modelStatus?: 'primary' | 'fallback';
}

export function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  error,
  modelStatus = 'primary',
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="flex flex-col h-full border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">biji kipli</CardTitle>
            <p className="text-xs text-indigo-100 mt-1">
              Asisten keuangan AI Anda
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <span
                className={`w-3 h-3 rounded-full ${
                  modelStatus === 'primary' ? 'bg-green-400' : 'bg-yellow-400'
                }`}
                title={
                  modelStatus === 'primary'
                    ? 'Gemini 3.6 Flash aktif'
                    : 'Gemini 3.5 Flash-Lite aktif'
                }
              />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <div className="text-4xl mb-4">👋</div>
            <p className="font-medium">Halo! Saya biji kipli</p>
            <p className="text-sm mt-2 max-w-xs">
              Ceritakan tentang transaksi Anda, dan saya akan membantu mencatatnya dengan cerdas.
            </p>
            <p className="text-xs mt-4 text-slate-400 max-w-xs">
              Contoh: &quot;Habis beli nasi goreng 25rb sama es teh 5rb di warung&quot;
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Ada kesalahan</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Input Area */}
      <div className="border-t p-4 bg-slate-50">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </Card>
  )
}
