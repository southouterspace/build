import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  RadarChartComponent,
  RadialChartComponent,
  ChartCard
} from '@/components/charts'
import type { ParsedData, ChartSettings } from '@/types'

interface ChartDisplayProps {
  data: ParsedData
  settings: ChartSettings
  isMobile?: boolean
  onSettingsClick?: () => void
}

export function ChartDisplay({ data, settings, isMobile = false, onSettingsClick }: ChartDisplayProps) {
  const { type, displayMode, valueColumns } = settings

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

  // Cards mode: render individual cards for each value column
  if (displayMode === 'cards') {
    return (
      <div className="flex h-full flex-col gap-4">
        {onSettingsClick && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              aria-label="Open chart settings"
            >
              <Settings2 style={{ width: 20, height: 20 }} />
            </Button>
          </div>
        )}
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {valueColumns.map((column, index) => (
            <ChartCard
              key={column}
              data={data}
              settings={settings}
              column={column}
              columnIndex={index}
            />
          ))}
        </div>
      </div>
    )
  }

  // Combined mode: render single chart with all columns
  const chartTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{chartTitle}</CardTitle>
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
