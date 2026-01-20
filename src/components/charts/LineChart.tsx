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
import { getColumnColor } from '@/lib/chart-colors'
import type { ChartVariant, ParsedData, ChartSettings } from '@/types'

interface LineChartProps {
  data: ParsedData
  settings: ChartSettings
  isMobile?: boolean
}

export function LineChartComponent({ data, settings, isMobile = false }: LineChartProps) {
  const { variant, categoryColumn, valueColumns, columnColors } = settings

  const chartConfig: ChartConfig = valueColumns.reduce((acc, col, index) => {
    acc[col] = {
      label: col,
      color: getColumnColor(col, index, columnColors)
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
        {valueColumns.map((col, index) => {
          const color = getColumnColor(col, index, columnColors)
          return (
            <Line
              key={col}
              type={getCurveType(variant)}
              dataKey={col}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
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
          )
        })}
      </RechartsLineChart>
    </ChartContainer>
  )
}
