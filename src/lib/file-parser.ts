import * as XLSX from 'xlsx'
import type { ParsedData } from '@/types'

/**
 * Checks if a string looks like a currency/numeric value.
 * Valid patterns:
 * - Simple numbers: "123", "123.45", "-123.45"
 * - Currency: "$123", "$1,234.56", "€100"
 * - Signed currency: "+ $123", "- $45.67"
 * - Parentheses negative: "(123.45)", "($123)"
 */
function isCurrencyOrNumeric(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return false

  // Pattern for valid currency/numeric values
  // Allows: optional sign, optional currency symbol, digits with optional commas and decimal
  const currencyPattern = /^[(\-+]?\s*[$€£¥₹₽₩฿₫₦]?\s*[\d,]+\.?\d*\s*\)?$/

  // Also check for signed currency like "+ $123" or "- $45"
  const signedCurrencyPattern = /^[+-]\s*[$€£¥₹₽₩฿₫₦]?\s*[\d,]+\.?\d*$/

  return currencyPattern.test(trimmed) || signedCurrencyPattern.test(trimmed)
}

/**
 * Parses a string value that may contain currency formatting.
 * Handles formats like: "$1,234.56", "+ $45566", "- $60", "(1234.56)"
 * Returns the numeric value or NaN if not parseable.
 */
function parseCurrencyValue(value: string): number {
  if (typeof value !== 'string') {
    return typeof value === 'number' ? value : NaN
  }

  let str = value.trim()
  if (str === '') return NaN

  // First check if this looks like a currency/numeric value
  if (!isCurrencyOrNumeric(str)) {
    return NaN
  }

  // Check for negative values in parentheses format: (1234.56)
  const isParenthesesNegative = str.startsWith('(') && str.endsWith(')')
  if (isParenthesesNegative) {
    str = str.slice(1, -1)
  }

  // Extract sign from prefix (handles "+ $" or "- $" formats)
  let sign = 1
  if (str.startsWith('-')) {
    sign = -1
    str = str.slice(1).trim()
  } else if (str.startsWith('+')) {
    sign = 1
    str = str.slice(1).trim()
  }

  // Apply parentheses negative
  if (isParenthesesNegative) {
    sign = -1
  }

  // Remove currency symbols and thousand separators
  str = str.replace(/[$€£¥₹₽₩฿₫₦,]/g, '').trim()

  // Parse the cleaned value
  const num = parseFloat(str)
  return isNaN(num) ? NaN : num * sign
}

/**
 * Attempts to parse a value as a number, including currency formats.
 * Returns the number if successful, or the original string if not.
 */
function parseNumericValue(value: string): number | string {
  const trimmed = value.trim()
  if (trimmed === '') return value

  // First try standard parseFloat (faster for simple numbers)
  const simpleNum = parseFloat(trimmed)
  if (!isNaN(simpleNum) && /^-?\d*\.?\d+$/.test(trimmed)) {
    return simpleNum
  }

  // Try currency parsing
  const currencyNum = parseCurrencyValue(trimmed)
  if (!isNaN(currencyNum)) {
    return currencyNum
  }

  return value
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
    throw new Error('Unsupported file format. Please use CSV or Excel files.')
  }

  // Use xlsx library to parse both CSV and Excel files
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    raw: true, // Keep raw values for currency parsing
  })

  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  // Get data as strings to preserve currency formatting for parsing
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, {
    raw: false, // Get formatted strings
    defval: '', // Default empty cells to empty string
  })

  if (jsonData.length === 0) {
    throw new Error('File is empty or has no valid data.')
  }

  const headers = Object.keys(jsonData[0])

  // Apply currency parsing to all values
  const parsedRows = jsonData.map((row) => {
    const newRow: Record<string, string | number> = {}
    headers.forEach((header) => {
      const value = row[header]
      if (typeof value === 'string') {
        newRow[header] = parseNumericValue(value)
      } else {
        newRow[header] = value
      }
    })
    return newRow
  })

  return analyzeData(headers, parsedRows)
}

function analyzeData(
  headers: string[],
  rows: Record<string, string | number>[]
): ParsedData {
  const numericColumns: string[] = []
  const categoricalColumns: string[] = []

  headers.forEach((header) => {
    const values = rows.map((row) => row[header])
    const numericCount = values.filter((v) => {
      if (typeof v === 'number') return true
      if (typeof v !== 'string') return false
      const parsed = parseCurrencyValue(v)
      return !isNaN(parsed)
    }).length

    if (numericCount >= values.length * 0.5) {
      numericColumns.push(header)
    } else {
      categoricalColumns.push(header)
    }
  })

  // Convert numeric strings to numbers
  const processedRows = rows.map((row) => {
    const newRow: Record<string, string | number> = {}
    headers.forEach((header) => {
      const value = row[header]
      if (numericColumns.includes(header)) {
        if (typeof value === 'number') {
          newRow[header] = value
        } else {
          const parsed = parseCurrencyValue(String(value))
          newRow[header] = isNaN(parsed) ? 0 : parsed
        }
      } else {
        newRow[header] = String(value)
      }
    })
    return newRow
  })

  return {
    headers,
    rows: processedRows,
    numericColumns,
    categoricalColumns
  }
}
