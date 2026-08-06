'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card className="flex flex-col h-full border-0 shadow-sm bg-white overflow-hidden flex-1">
      {/* Social Style Chat Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Avatar Profile Bubble */}
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-650 text-[#3E6BEC] text-sm flex-shrink-0">
            BK
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-none">biji kipli</h3>
            {/* Online Pulse Indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Aktif</span>
            </div>
          </div>
        </div>

        {/* Model status badge / loading */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin text-indigo-500" />
          ) : (
            <span
              className={`text-[9px] font-bold px-2 py-1 rounded-md select-none ${
                modelStatus === 'primary' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/30' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100/30'
              }`}
            >
              {modelStatus === 'primary' ? 'Gemini 3.6 Active' : 'Gemini 3.5 Lite'}
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area with soft WhatsApp style pattern */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#FAF9F6] space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-10">
            <div className="text-4xl mb-4 animate-bounce-slow">👋</div>
            <p className="font-extrabold text-sm text-slate-700">Halo! Saya biji kipli</p>
            <p className="text-xs mt-2 max-w-xs text-slate-500 leading-relaxed">
              Ketik catatan keuangan kamu di sini (bisa banyak baris sekaligus!), dan aku akan catat semuanya secara otomatis.
            </p>
            <div className="bg-white/70 border border-slate-100/80 rounded-2xl p-4 mt-6 max-w-xs shadow-sm text-left space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contoh Chat:</p>
              <p className="text-xs text-slate-600 font-semibold italic">
                &quot;tgl 5 beli bensin 25k, lalu tgl 6 dapet bonus 1jt&quot;
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-900">Ada kesalahan</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </Card>
  )
}
