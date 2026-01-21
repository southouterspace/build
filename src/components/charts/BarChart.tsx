import { useMemo } from 'react'
import {
  Bar,
  BarChart as RechartsBarChart,
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
import type { ParsedData, ChartSettings } from '@/types'

interface BarChartProps {
  data: ParsedData
  settings: ChartSettings
  isMobile?: boolean
}

export function BarChartComponent({ data, settings, isMobile = false }: BarChartProps) {
  const { variant, categoryColumn, valueColumns, columnColors } = settings

  const chartConfig: ChartConfig = valueColumns.reduce((acc, col, index) => {
    acc[col] = {
      label: col,
      color: getColumnColor(col, index, columnColors)
    }
    return acc
  }, {} as ChartConfig)

  const isHorizontal = variant === 'horizontal'
  const isStacked = variant === 'stacked'
  const showLabels = variant === 'label'
  const showLegend = valueColumns.length > 1 || variant === 'multiple'

  // Calculate tight Y-axis domain to avoid excessive empty space
  const yAxisDomain = useMemo(
    () => calculateYAxisDomain(data.rows, valueColumns),
    [data.rows, valueColumns]
  )

  // Mobile-specific axis settings
  const xAxisProps = isMobile && !isHorizontal
    ? { angle: -45, textAnchor: 'end' as const, height: 80, fontSize: 11 }
    : {}

  return (
    <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
      <RechartsBarChart
        data={data.rows}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 10, left: 0, bottom: isMobile ? 20 : 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {isHorizontal ? (
          <>
            <YAxis
              type="category"
              dataKey={categoryColumn}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <XAxis type="number" tickLine={false} axisLine={false} domain={yAxisDomain} />
          </>
        ) : (
          <>
            <XAxis
              dataKey={categoryColumn}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              {...xAxisProps}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={yAxisDomain} />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {valueColumns.map((col, index) => {
          // Radius array: [topLeft, topRight, bottomRight, bottomLeft]
          // Vertical bars: rounded on top [4, 4, 0, 0]
          // Horizontal bars: rounded on right (end) [0, 4, 4, 0]
          const getRadius = (): [number, number, number, number] => {
            if (isStacked) return [0, 0, 0, 0]
            if (isHorizontal) return [0, 4, 4, 0]
            return [4, 4, 0, 0]
          }

          const color = getColumnColor(col, index, columnColors)

          return (
            <Bar
              key={col}
              dataKey={col}
              stackId={isStacked ? 'stack' : undefined}
              fill={color}
              radius={getRadius()}
            >
              {showLabels && (
                <LabelList
                  dataKey={col}
                  position={isHorizontal ? 'right' : 'top'}
                  className="fill-foreground"
                  fontSize={12}
                />
              )}
            </Bar>
          )
        })}
      </RechartsBarChart>
    </ChartContainer>
  )
}
