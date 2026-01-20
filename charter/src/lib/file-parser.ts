import * as XLSX from 'xlsx'
import type { ParsedData } from '@/types'

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return parseCSV(file)
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file)
  }

  throw new Error('Unsupported file format. Please use CSV or Excel files.')
}

async function parseCSV(file: File): Promise<ParsedData> {
  const text = await file.text()
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row.')
  }

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string | number>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string | number> = {}

    headers.forEach((header, index) => {
      const value = values[index] || ''
      const numValue = parseFloat(value)
      row[header] = !isNaN(numValue) && value.trim() !== '' ? numValue : value
    })

    rows.push(row)
  }

  return analyzeData(headers, rows)
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

async function parseExcel(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet)

  if (jsonData.length === 0) {
    throw new Error('Excel file is empty or has no valid data.')
  }

  const headers = Object.keys(jsonData[0])
  return analyzeData(headers, jsonData)
}

function analyzeData(
  headers: string[],
  rows: Record<string, string | number>[]
): ParsedData {
  const numericColumns: string[] = []
  const categoricalColumns: string[] = []

  headers.forEach((header) => {
    const values = rows.map((row) => row[header])
    const numericCount = values.filter(
      (v) => typeof v === 'number' || (!isNaN(parseFloat(String(v))) && String(v).trim() !== '')
    ).length

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
        newRow[header] = typeof value === 'number' ? value : parseFloat(String(value)) || 0
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
