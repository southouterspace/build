export type ChartType = 'area' | 'bar' | 'line' | 'radar' | 'radial'

export type ChartVariant =
  | 'default'
  | 'stacked'
  | 'expanded'
  | 'linear'
  | 'step'
  | 'horizontal'
  | 'multiple'
  | 'legend'
  | 'label'

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

export interface ParsedData {
  headers: string[]
  rows: Record<string, string | number>[]
  numericColumns: string[]
  categoricalColumns: string[]
}

export interface ChartSettings {
  type: ChartType
  variant: ChartVariant
  categoryColumn: string
  valueColumns: string[]
}

export interface AppState {
  parsedData: ParsedData | null
  chartSettings: ChartSettings
  isLoading: boolean
}

export const CHART_VARIANTS: Record<ChartType, ChartVariant[]> = {
  area: ['default', 'stacked', 'expanded', 'linear', 'step', 'legend'],
  bar: ['default', 'horizontal', 'multiple', 'stacked', 'label'],
  line: ['default', 'linear', 'step', 'multiple', 'label', 'legend'],
  radar: ['default', 'multiple', 'legend'],
  radial: ['default', 'stacked', 'label', 'legend']
}

export const CHART_TYPE_REQUIREMENTS: Record<ChartType, { minNumericColumns: number; minRows: number }> = {
  area: { minNumericColumns: 1, minRows: 2 },
  bar: { minNumericColumns: 1, minRows: 1 },
  line: { minNumericColumns: 1, minRows: 2 },
  radar: { minNumericColumns: 3, minRows: 1 },
  radial: { minNumericColumns: 1, minRows: 1 }
}
