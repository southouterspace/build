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
import { getColumnColor } from '@/lib/chart-colors'
import type { ParsedData, ChartSettings } from '@/types'

interface RadarChartProps {
  data: ParsedData
  settings: ChartSettings
  isMobile?: boolean
}

export function RadarChartComponent({ data, settings, isMobile = false }: RadarChartProps) {
  const { variant, categoryColumn, valueColumns, columnColors } = settings

  const chartConfig: ChartConfig = valueColumns.reduce((acc, col, index) => {
    acc[col] = {
      label: col,
      color: getColumnColor(col, index, columnColors)
    }
    return acc
  }, {} as ChartConfig)

  const showLegend = variant === 'legend' || valueColumns.length > 1

  return (
    <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
      <RechartsRadarChart data={data.rows}>
        <PolarGrid />
        <PolarAngleAxis dataKey={categoryColumn} tick={{ fontSize: isMobile ? 10 : 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {valueColumns.map((col, index) => {
          const color = getColumnColor(col, index, columnColors)
          return (
            <Radar
              key={col}
              name={col}
              dataKey={col}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          )
        })}
      </RechartsRadarChart>
    </ChartContainer>
  )
}
