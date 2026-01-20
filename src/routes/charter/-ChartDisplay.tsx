import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  RadarChartComponent,
  RadialChartComponent
} from '@/components/charts'
import type { ParsedData, ChartSettings } from '@/types'

interface ChartDisplayProps {
  data: ParsedData
  settings: ChartSettings
}

export function ChartDisplay({ data, settings }: ChartDisplayProps) {
  const { type, variant } = settings

  const renderChart = () => {
    switch (type) {
      case 'area':
        return <AreaChartComponent data={data} settings={settings} />
      case 'bar':
        return <BarChartComponent data={data} settings={settings} />
      case 'line':
        return <LineChartComponent data={data} settings={settings} />
      case 'pie':
        return <PieChartComponent data={data} settings={settings} />
      case 'radar':
        return <RadarChartComponent data={data} settings={settings} />
      case 'radial':
        return <RadialChartComponent data={data} settings={settings} />
      default:
        return null
    }
  }

  const chartTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`
  const chartDescription = `Variant: ${variant.charAt(0).toUpperCase() + variant.slice(1)}`

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {renderChart()}
      </CardContent>
    </Card>
  )
}
