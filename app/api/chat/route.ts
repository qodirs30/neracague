import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { AiResponsePayload, MessageRole } from '@/types/chat'
import type { AiExtractedTransaction } from '@/types/transaction'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface RequestBody {
  messages: Array<{
    role: MessageRole
    content: string
  }>
  userMessage: string
}

function extractTransactionFromResponse(
  text: string
): AiExtractedTransaction | undefined {
  const transactionMatch = text.match(
    /\[TRANSACTION_EXTRACT\]([\s\S]*?)\[\/TRANSACTION_EXTRACT\]/
  )

  if (!transactionMatch) return undefined

  try {
    const jsonStr = transactionMatch[1].trim()
    const transaction = JSON.parse(jsonStr)

    // Validate transaction structure
    if (
      transaction.amount &&
      transaction.category &&
      transaction.description &&
      transaction.type
    ) {
      return {
        amount: Number(transaction.amount),
        category: transaction.category,
        description: transaction.description,
        type: transaction.type,
      }
    }
  } catch (error) {
    console.error('Error parsing transaction:', error)
  }

  return undefined
}

function cleanResponseText(text: string): string {
  return text.replace(
    /\[TRANSACTION_EXTRACT\]([\s\S]*?)\[\/TRANSACTION_EXTRACT\]/,
    ''
  )
}

async function callGeminiModel(
  modelId: string,
  messages: Array<{ role: MessageRole; content: string }>,
  userMessage: string
): Promise<AiResponsePayload> {
  const model = genAI.getGenerativeModel({ model: modelId })

  // Build conversation history
  const conversationHistory = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  // Start chat with system prompt and history
  const chat = model.startChat({
    history: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  })

  // Send new user message
  const result = await chat.sendMessage(userMessage)
  const responseText = result.response.text()

  // Extract transaction if exists
  const extractedTransaction = extractTransactionFromResponse(responseText)
  const cleanedText = cleanResponseText(responseText)

  return {
    text: cleanedText.trim(),
    transaction: extractedTransaction,
    modelUsed: modelId as 'gemini-3.6-flash' | 'gemini-3.5-flash-lite',
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    const body: RequestBody = await request.json()
    const { messages, userMessage } = body

    if (!userMessage || typeof userMessage !== 'string') {
      return Response.json(
        { error: 'userMessage diperlukan' },
        { status: 400 }
      )
    }

    // Attempt with Primary Model: Gemini 3.6 Flash
    try {
      console.log('[biji kipli] Using Gemini 3.6 Flash')
      const response = await callGeminiModel(
        'gemini-3.6-flash',
        messages,
        userMessage
      )
      return Response.json(response)
    } catch (primaryError: unknown) {
      const errorMessage = primaryError instanceof Error ? primaryError.message : String(primaryError)
      console.warn(
        '[biji kipli] Primary model failed, rolling back to Gemini 3.5 Flash-Lite...',
        errorMessage
      )

      // Fallback to Gemini 3.5 Flash-Lite
      try {
        const fallbackResponse = await callGeminiModel(
          'gemini-3.5-flash-lite',
          messages,
          userMessage
        )
        return Response.json(fallbackResponse)
      } catch (fallbackError: unknown) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        console.error('[biji kipli] Fallback model failed too:', fallbackErrorMessage)
        return Response.json(
          {
            error:
              'Maaf, biji kipli sedang tidak tersedia. Silakan coba lagi beberapa saat.',
          },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error('[biji kipli] API Error:', error)
    return Response.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
