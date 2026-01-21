import { Area, AreaChart } from 'recharts'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { getColumnColor } from '@/lib/chart-colors'
import type { ParsedData, ChartSettings } from '@/types'

interface ChartCardProps {
  data: ParsedData
  settings: ChartSettings
  column: string
  columnIndex: number
}

export function ChartCard({ data, settings, column, columnIndex }: ChartCardProps) {
  const { columnColors } = settings
  const color = getColumnColor(column, columnIndex, columnColors)

  const chartConfig: ChartConfig = {
    [column]: {
      label: column,
      color: color
    }
  }

  // Calculate summary stats
  const values = data.rows.map(row => Number(row[column]) || 0)
  const total = values.reduce((sum, val) => sum + val, 0)
  const formattedTotal = total.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    notation: total > 999999 ? 'compact' : 'standard'
  })

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>{column}</CardTitle>
        <CardDescription>{formattedTotal} Total</CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="aspect-[1/0.35]">
        <AreaChart
          accessibilityLayer
          data={data.rows}
          margin={{
            left: 0,
            right: 0
          }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" hideLabel />}
          />
          <Area
            dataKey={column}
            type="linear"
            fill={`var(--color-${column})`}
            fillOpacity={0.4}
            stroke={`var(--color-${column})`}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}
