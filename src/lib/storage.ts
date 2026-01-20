import type { ParsedData, ChartSettings } from '@/types'

const STORAGE_KEY = 'charter_state'

interface StoredState {
  parsedData: ParsedData | null
  chartSettings: ChartSettings
}

export function saveState(state: StoredState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save state to session storage:', error)
  }
}

export function loadState(): StoredState | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load state from session storage:', error)
  }
  return null
}

export function clearState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear state from session storage:', error)
  }
}
