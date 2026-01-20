import {
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
  PolarRadiusAxis,
  Label
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

interface RadialChartProps {
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

export function RadialChartComponent({ data, settings, isMobile = false }: RadialChartProps) {
  const { variant, categoryColumn, valueColumns } = settings

  // For radial charts, we need to transform the data
  // Each row becomes a radial bar segment
  const maxItems = isMobile ? 4 : 5
  const transformedData = data.rows.slice(0, maxItems).map((row, index) => ({
    name: String(row[categoryColumn]),
    value: Number(row[valueColumns[0]]) || 0,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }))

  const chartConfig: ChartConfig = transformedData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill
    }
    return acc
  }, {} as ChartConfig)

  const totalValue = transformedData.reduce((sum, item) => sum + item.value, 0)

  const showLabels = variant === 'label'
  const showLegend = variant === 'legend'
  const isStacked = variant === 'stacked'

  if (isStacked) {
    // Stacked radial - show all values as concentric rings
    const stackedData = [
      data.rows.slice(0, maxItems).reduce((acc, row) => {
        acc[String(row[categoryColumn])] = Number(row[valueColumns[0]]) || 0
        return acc
      }, {} as Record<string, number>)
    ]

    const stackedConfig: ChartConfig = data.rows.slice(0, maxItems).reduce((acc, row, index) => {
      const key = String(row[categoryColumn])
      acc[key] = {
        label: key,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }
      return acc
    }, {} as ChartConfig)

    return (
      <ChartContainer config={stackedConfig} className="mx-auto aspect-square w-full max-w-[min(100%,70vh)]">
        <RechartsRadialBarChart
          data={stackedData}
          innerRadius="20%"
          outerRadius="80%"
          startAngle={180}
          endAngle={0}
        >
          <ChartTooltip content={<ChartTooltipContent />} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {totalValue.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground"
                      >
                        Total
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
          {data.rows.slice(0, maxItems).map((row, index) => (
            <RadialBar
              key={String(row[categoryColumn])}
              dataKey={String(row[categoryColumn])}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              stackId="stack"
              cornerRadius={5}
            />
          ))}
        </RechartsRadialBarChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[min(100%,70vh)]">
      <RechartsRadialBarChart
        data={transformedData}
        innerRadius="20%"
        outerRadius={showLegend ? '70%' : '80%'}
        startAngle={180}
        endAngle={-180}
      >
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        {showLegend && <ChartLegend content={<ChartLegendContent nameKey="name" />} />}
        <RadialBar
          dataKey="value"
          background
          cornerRadius={10}
          label={showLabels ? { fill: '#fff', position: 'insideStart' } : false}
        />
        {!showLabels && (
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {totalValue.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-sm"
                      >
                        Total
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        )}
      </RechartsRadialBarChart>
    </ChartContainer>
  )
}
