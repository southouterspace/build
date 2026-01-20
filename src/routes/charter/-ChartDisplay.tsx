import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
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
  isMobile?: boolean
  onSettingsClick?: () => void
}

export function ChartDisplay({ data, settings, isMobile = false, onSettingsClick }: ChartDisplayProps) {
  const { type, variant } = settings

  const renderChart = () => {
    switch (type) {
      case 'area':
        return <AreaChartComponent data={data} settings={settings} isMobile={isMobile} />
      case 'bar':
        return <BarChartComponent data={data} settings={settings} isMobile={isMobile} />
      case 'line':
        return <LineChartComponent data={data} settings={settings} isMobile={isMobile} />
      case 'pie':
        return <PieChartComponent data={data} settings={settings} isMobile={isMobile} />
      case 'radar':
        return <RadarChartComponent data={data} settings={settings} isMobile={isMobile} />
      case 'radial':
        return <RadialChartComponent data={data} settings={settings} isMobile={isMobile} />
      default:
        return null
    }
  }

  const chartTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`
  const chartDescription = `Variant: ${variant.charAt(0).toUpperCase() + variant.slice(1)}`

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{chartTitle}</CardTitle>
          <CardDescription>{chartDescription}</CardDescription>
        </div>
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            aria-label="Open chart settings"
          >
            <Settings2 style={{ width: 20, height: 20 }} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-6">
        {renderChart()}
      </CardContent>
    </Card>
  )
}
