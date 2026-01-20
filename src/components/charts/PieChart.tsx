import { useMemo } from 'react'
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Label,
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
import type { ParsedData, ChartSettings } from '@/types'

interface PieChartProps {
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

export function PieChartComponent({ data, settings }: PieChartProps) {
  const { variant, categoryColumn, valueColumns } = settings

  // For pie charts, we aggregate data by category and use the first value column
  const valueColumn = valueColumns[0]

  // Transform data for pie chart: aggregate by category
  const pieData = useMemo(() => {
    if (!categoryColumn || !valueColumn) return []

    const aggregated = new Map<string, number>()

    data.rows.forEach((row) => {
      const category = String(row[categoryColumn])
      const value = Math.abs(Number(row[valueColumn]) || 0)

      if (aggregated.has(category)) {
        aggregated.set(category, aggregated.get(category)! + value)
      } else {
        aggregated.set(category, value)
      }
    })

    return Array.from(aggregated.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [data.rows, categoryColumn, valueColumn])

  // Calculate total for center label
  const total = useMemo(() => {
    return pieData.reduce((sum, item) => sum + item.value, 0)
  }, [pieData])

  // Build chart config from pie data
  const chartConfig: ChartConfig = useMemo(() => {
    return pieData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }
      return acc
    }, {} as ChartConfig)
  }, [pieData])

  const isDonut = variant === 'donut'
  const showLabels = variant === 'label'
  const showLegend = variant === 'legend'

  if (pieData.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
        Select a category and value column to display the pie chart
      </div>
    )
  }

  // Use percentage-based radii for fluid sizing
  const outerR = '80%'
  const innerR = isDonut ? '50%' : 0

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[min(100%,70vh)]">
      <RechartsPieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        {showLegend && (
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 16 }}
          />
        )}
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={innerR}
          outerRadius={outerR}
          strokeWidth={2}
          stroke="var(--background)"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          {showLabels && (
            <LabelList
              dataKey="name"
              className="fill-foreground"
              stroke="none"
              fontSize={12}
              formatter={(value: unknown) => {
                const str = String(value ?? '')
                return str.length > 12 ? `${str.slice(0, 12)}...` : str
              }}
            />
          )}
          {isDonut && (
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground text-sm"
                      >
                        Total
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          )}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  )
}
