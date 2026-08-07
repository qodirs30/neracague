export function formatCurrency(amount: number, locale = 'id-ID'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, locale = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateShort(date: string | Date, locale = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatMonth(date: string, locale = 'id-ID'): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(d);
}

export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthStart(date?: string): string {
  const d = date ? new Date(date) : new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

export function getMonthEnd(date?: string): string {
  const d = date ? new Date(date) : new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().split('T')[0];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ClientExtractedTransaction {
  amount: number;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
}

// Parse a single sentence part for a transaction
function parseSinglePart(part: string): ClientExtractedTransaction | null {
  const normalizedMsg = part.toLowerCase();

  // Extract amount supporting floats and decimals (patterns: "25 ribu", "1.8jt", "25000", "Rp1.6jt", etc.)
  let amount: number | null = null;
  const amountMatch = part.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb|k|juta|jt)?|\bRp[\s]?(\d+(?:[.,]\d+)?)/i);
  if (amountMatch) {
    let numStr = amountMatch[1] || amountMatch[3];
    // Normalize decimal separator to dot for parseFloat
    numStr = numStr.replace(',', '.');
    let num = parseFloat(numStr);
    const suffix = amountMatch[2] ? amountMatch[2].toLowerCase() : '';
    if (['ribu', 'rb', 'k'].includes(suffix)) {
      num = num * 1000;
    } else if (['juta', 'jt'].includes(suffix)) {
      num = num * 1000000;
    }
    amount = num;
  }

  if (!amount || amount < 100) return null;

  // Detect transaction type: default to EXPENSE, look for income keywords
  const incomeKeywords = ['dapat', 'terima', 'gaji', 'bonus', 'rejeki', 'bayaran', 'transfer', 'masuk', 'dapat uang', 'hadiah'];
  const isIncome = incomeKeywords.some((keyword) => normalizedMsg.includes(keyword));
  const type: 'INCOME' | 'EXPENSE' = isIncome ? 'INCOME' : 'EXPENSE';

  // Detect category
  const categoryRules: [string[], string][] = [
    [['makan', 'nasi', 'roti', 'ayam', 'ikan', 'warung', 'cafe', 'restoran', 'jajan', 'snack', 'kopi', 'teh', 'mie', 'burger'], 'Makanan'],
    [['bensin', 'motor', 'mobil', 'taksi', 'ojek', 'angkot', 'kereta', 'bus', 'isi bbm'], 'Transportasi'],
    [['listrik', 'air', 'internet', 'tagihan', 'cicilan', 'pulsa', 'langganan', 'paylater', 'spaylater', 'gopaylater', 'kredit', 'pinjaman'], 'Tagihan'],
    [['film', 'game', 'hiburan', 'konser', 'tiket', 'liburan', 'main', 'nonton'], 'Hiburan'],
    [['obat', 'dokter', 'rumah sakit', 'kesehatan', 'vitamin', 'apotek'], 'Kesehatan'],
    [['belanja', 'baju', 'sepatu', 'gadget', 'barang', 'tas', 'buku', 'shopping', 'hadiah'], 'Belanja'],
  ];

  let category = isIncome ? 'Pendapatan' : 'Lainnya';
  for (const [keywords, cat] of categoryRules) {
    if (keywords.some((kw) => normalizedMsg.includes(kw))) {
      category = cat;
      break;
    }
  }

  // Extract description
  let description = part.replace(/(\d+)\s*(ribu|rb|k|Rp|juta|jt)?/gi, '').trim();
  // clean up common noise words
  description = description.replace(/^(beli|dapat|terima|gaji|hadiah|catat|transaksi)\s+/gi, '');
  if (description.length > 50) {
    description = description.substring(0, 50);
  }
  if (!description || description.length < 3) {
    description = category === 'Lainnya' ? 'Transaksi' : category.toLowerCase();
  }

  return {
    amount,
    category,
    description: description.trim(),
    type,
  };
}

export function extractTransactionFromUserMessage(
  message: string
): ClientExtractedTransaction[] | null {
  // Replace Indonesian decimal commas with dots first to prevent split on decimals, e.g. "1,8jt" -> "1.8jt"
  const cleaned = message.replace(/(\d+),(\d+)/g, '$1.$2');

  // Split message by separators: "dan", "lalu", "trus", commas (which are list separators now), or newlines
  const parts = cleaned.split(/,|\bdan\b|\blalu\b|\btrus\b|\n/i).map((p) => p.trim()).filter(Boolean);
  const results: ClientExtractedTransaction[] = [];

  for (const part of parts) {
    const tx = parseSinglePart(part);
    if (tx) {
      results.push(tx);
    }
  }

  return results.length > 0 ? results : null;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Makanan: '#3b82f6',       // Blue
  Transportasi: '#f59e0b',  // Yellow/Amber
  Tagihan: '#ec4899',       // Pink
  Hiburan: '#10b981',       // Emerald
  Kesehatan: '#8b5cf6',     // Violet
  Belanja: '#f97316',       // Orange
  Pendapatan: '#22c55e',    // Green
  Lainnya: '#64748b',       // Slate
}

export function getCategoryColor(category: string): string {
  const mapped = CATEGORY_COLORS[category]
  if (mapped) return mapped

  // Hash-based color mapping for custom categories
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorList = Object.values(CATEGORY_COLORS)
  const index = Math.abs(hash) % colorList.length
  return colorList[index]
}
