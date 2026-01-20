import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import type { ChartVariant, ParsedData, ChartSettings } from '@/types'

interface AreaChartProps {
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

export function AreaChartComponent({ data, settings, isMobile = false }: AreaChartProps) {
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

  const getStackId = (v: ChartVariant) => {
    return v === 'stacked' || v === 'expanded' ? 'stack' : undefined
  }

  const getFillOpacity = () => {
    return 0.4
  }

  const showLegend = variant === 'legend' || valueColumns.length > 1

  // Mobile-specific axis settings
  const xAxisProps = isMobile
    ? { angle: -45, textAnchor: 'end' as const, height: 80, fontSize: 11 }
    : {}

  return (
    <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
      <RechartsAreaChart
        data={data.rows}
        margin={{ top: 10, right: 10, left: 0, bottom: isMobile ? 20 : 0 }}
        stackOffset={variant === 'expanded' ? 'expand' : undefined}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={categoryColumn}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          {...xAxisProps}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={variant === 'expanded' ? (v) => `${(v * 100).toFixed(0)}%` : undefined}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && (
          <ChartLegend content={<ChartLegendContent />} />
        )}
        {valueColumns.map((col, index) => (
          <Area
            key={col}
            type={getCurveType(variant)}
            dataKey={col}
            stackId={getStackId(variant)}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={getFillOpacity()}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  )
}
