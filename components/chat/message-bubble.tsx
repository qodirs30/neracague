'use client'

import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types/chat'

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatChatTime(timestamp: number) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4.5`}>
      <div
        className={`max-w-[78%] sm:max-w-[70%] px-4 py-3 rounded-2xl relative shadow-sm border ${
          isUser
            ? 'bg-[#3E6BEC] text-white border-transparent rounded-tr-none'
            : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
        }`}
      >
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
          {message.content}
        </p>

        {/* 1. Show single extracted transaction info */}
        {message.extractedTransaction && (
          <div className={`mt-3 pt-2.5 border-t border-dashed ${isUser ? 'border-white/20' : 'border-slate-100'} space-y-1.5`}>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-85">✓ Transaksi Tercatat</p>
            <div className={`p-2 rounded-xl text-xs flex items-center justify-between ${
              isUser ? 'bg-white/15' : 'bg-slate-50 border border-slate-100/50'
            }`}>
              <div className="truncate max-w-[120px] sm:max-w-[160px]">
                <p className="font-bold truncate">{message.extractedTransaction.description}</p>
                <p className="text-[9px] opacity-75">{message.extractedTransaction.category}</p>
              </div>
              <span className={`font-extrabold ${message.extractedTransaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {message.extractedTransaction.type === 'INCOME' ? '+' : '-'}
                {message.extractedTransaction.amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* 2. Show multiple extracted transactions info */}
        {message.extractedTransactions && message.extractedTransactions.length > 0 && (
          <div className={`mt-3 pt-2.5 border-t border-dashed ${isUser ? 'border-white/20' : 'border-slate-100'} space-y-1.5`}>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-85">✓ {message.extractedTransactions.length} Transaksi Tercatat</p>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
              {message.extractedTransactions.map((tx, idx) => (
                <div key={idx} className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 ${
                  isUser ? 'bg-white/15' : 'bg-slate-50 border border-slate-100/50'
                }`}>
                  <div className="truncate max-w-[120px] sm:max-w-[160px]">
                    <p className="font-bold truncate">{tx.description}</p>
                    <p className="text-[9px] opacity-75">{tx.category}</p>
                  </div>
                  <span className={`font-extrabold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} flex-shrink-0`}>
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {tx.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Metadata & Timestamp */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {/* Model indicator */}
          {!isUser && message.modelUsed && (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
              {message.modelUsed === 'gemini-3.6-flash' ? 'Gemini 3.6' : 'Gemini 3.5'}
            </span>
          )}
          <span className={`text-[9px] font-bold ml-auto ${isUser ? 'text-white/60' : 'text-slate-400'}`}>
            {formatChatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
