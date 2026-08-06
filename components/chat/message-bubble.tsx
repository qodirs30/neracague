'use client'

import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils-extended'
import type { ChatMessage } from '@/types/chat'

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-emerald-500 text-white rounded-br-none'
            : 'bg-indigo-50 text-slate-900 rounded-bl-none border border-indigo-200'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Show extracted transaction info */}
        {message.extractedTransaction && (
          <div className="mt-3 pt-3 border-t border-opacity-20 border-current">
            <p className="text-xs font-semibold mb-2 opacity-90">Transaksi Tercatat:</p>
            <div className="space-y-1 text-xs">
              <div>
                Rp {message.extractedTransaction.amount.toLocaleString('id-ID')}
              </div>
              <Badge
                variant={
                  message.extractedTransaction.type === 'INCOME' ? 'income' : 'expense'
                }
                className="text-xs"
              >
                {message.extractedTransaction.type === 'INCOME' ? 'Masuk' : 'Keluar'}
              </Badge>
              <div>{message.extractedTransaction.category}</div>
            </div>
          </div>
        )}

        {/* Model indicator */}
        {message.modelUsed && !isUser && (
          <div className="mt-2 text-xs opacity-70">
            {message.modelUsed === 'gemini-3.6-flash' ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Gemini 3.6 Flash
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Gemini 3.5 Flash-Lite
              </span>
            )}
          </div>
        )}

        <p className="text-xs mt-2 opacity-70">
          {formatDate(new Date(message.createdAt))}
        </p>
      </div>
    </div>
  )
}
