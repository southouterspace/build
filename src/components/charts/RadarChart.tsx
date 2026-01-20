import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import type { ParsedData, ChartSettings } from '@/types'

interface RadarChartProps {
  data: ParsedData
  settings: ChartSettings
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
]

export function RadarChartComponent({ data, settings }: RadarChartProps) {
  const { variant, categoryColumn, valueColumns } = settings

  const chartConfig: ChartConfig = valueColumns.reduce((acc, col, index) => {
    acc[col] = {
      label: col,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }
    return acc
  }, {} as ChartConfig)

  const showLegend = variant === 'legend' || valueColumns.length > 1

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <RechartsRadarChart data={data.rows}>
        <PolarGrid />
        <PolarAngleAxis dataKey={categoryColumn} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {valueColumns.map((col, index) => (
          <Radar
            key={col}
            name={col}
            dataKey={col}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.3}
          />
        ))}
      </RechartsRadarChart>
    </ChartContainer>
  )
}
