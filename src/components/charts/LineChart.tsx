import { useMemo } from 'react'
import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import { calculateYAxisDomain } from '@/lib/chart-utils'
import type { ChartVariant, ParsedData, ChartSettings } from '@/types'

interface LineChartProps {
  data: ParsedData
  settings: ChartSettings
  isMobile?: boolean
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
]

export function LineChartComponent({ data, settings, isMobile = false }: LineChartProps) {
  const { variant, categoryColumn, valueColumns } = settings

  const chartConfig: ChartConfig = valueColumns.reduce((acc, col, index) => {
    acc[col] = {
      label: col,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }
    return acc
  }, {} as ChartConfig)

  const getCurveType = (v: ChartVariant) => {
    switch (v) {
      case 'linear':
        return 'linear'
      case 'step':
        return 'step'
      default:
        return 'natural'
    }
  }

  const showLabels = variant === 'label'
  const showLegend = variant === 'legend' || valueColumns.length > 1

  // Calculate tight Y-axis domain to avoid excessive empty space
  const yAxisDomain = useMemo(
    () => calculateYAxisDomain(data.rows, valueColumns),
    [data.rows, valueColumns]
  )

  // Mobile-specific axis settings
  const xAxisProps = isMobile
    ? { angle: -45, textAnchor: 'end' as const, height: 80, fontSize: 11 }
    : {}

  return (
    <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
      <RechartsLineChart
        data={data.rows}
        margin={{ top: 20, right: 10, left: 0, bottom: isMobile ? 20 : 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={categoryColumn}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          {...xAxisProps}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={yAxisDomain} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {valueColumns.map((col, index) => (
          <Line
            key={col}
            type={getCurveType(variant)}
            dataKey={col}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS[index % CHART_COLORS.length] }}
            activeDot={{ r: 6 }}
          >
            {showLabels && (
              <LabelList
                dataKey={col}
                position="top"
                className="fill-foreground"
                fontSize={12}
                offset={8}
              />
            )}
          </Line>
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}
