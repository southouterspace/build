import { DEFAULT_CHART_COLORS } from '@/components/ui/color-picker'

/**
 * Get the color for a column based on custom colors or default
 */
export function getColumnColor(
  column: string,
  index: number,
  columnColors: Record<string, string>
): string {
  return columnColors[column] || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
}

/**
 * Fallback colors using CSS variables (for legacy support)
 */
export const CHART_CSS_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
]
