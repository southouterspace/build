import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import type { ChartType, ChartVariant, ChartSettings, ParsedData } from '@/types'
import { CHART_VARIANTS, CHART_TYPE_REQUIREMENTS } from '@/types'

interface ConfigPanelProps {
  data: ParsedData
  settings: ChartSettings
  onSettingsChange: (settings: ChartSettings) => void
  onReset: () => void
  variant?: 'default' | 'drawer'
}

export function ConfigPanel({
  data,
  settings,
  onSettingsChange,
  onReset,
  variant: panelVariant = 'default'
}: ConfigPanelProps) {
  const { type, variant, categoryColumn, valueColumns } = settings
  const { numericColumns, categoricalColumns, headers } = data

  // Check if data has negative values in numeric columns
  const hasNegativeValues = numericColumns.some((col) =>
    data.rows.some((row) => {
      const val = row[col]
      return typeof val === 'number' && val < 0
    })
  )

  const isChartTypeAvailable = (chartType: ChartType): boolean => {
    const requirements = CHART_TYPE_REQUIREMENTS[chartType]
    const meetsRequirements =
      numericColumns.length >= requirements.minNumericColumns &&
      data.rows.length >= requirements.minRows

    // Pie and radial charts don't display negative values well
    if ((chartType === 'pie' || chartType === 'radial') && hasNegativeValues) {
      return false
    }

    return meetsRequirements
  }

  const chartTypeOptions = [
    { value: 'area', label: 'Area Chart', disabled: !isChartTypeAvailable('area') },
    { value: 'bar', label: 'Bar Chart', disabled: !isChartTypeAvailable('bar') },
    { value: 'line', label: 'Line Chart', disabled: !isChartTypeAvailable('line') },
    { value: 'pie', label: 'Pie Chart', disabled: !isChartTypeAvailable('pie') },
    { value: 'radar', label: 'Radar Chart', disabled: !isChartTypeAvailable('radar') },
    { value: 'radial', label: 'Radial Chart', disabled: !isChartTypeAvailable('radial') }
  ]

  const variantOptions = CHART_VARIANTS[type].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1)
  }))

  const categoryOptions = [...categoricalColumns, ...headers].filter(
    (col, index, self) => self.indexOf(col) === index
  ).map((col) => ({ value: col, label: col }))

  const handleTypeChange = (newType: ChartType) => {
    const newVariants = CHART_VARIANTS[newType]
    const newVariant = newVariants.includes(variant) ? variant : newVariants[0]
    onSettingsChange({ ...settings, type: newType, variant: newVariant })
  }

  const handleValueColumnToggle = (column: string) => {
    const newValueColumns = valueColumns.includes(column)
      ? valueColumns.filter((c) => c !== column)
      : [...valueColumns, column]

    if (newValueColumns.length === 0) {
      return
    }

    onSettingsChange({ ...settings, valueColumns: newValueColumns })
  }

  const configContent = (
    <>
      <div className="space-y-2">
        <Label htmlFor="chart-type">Chart Type</Label>
        <Select
          id="chart-type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ChartType)}
          options={chartTypeOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chart-variant">Variant</Label>
        <Select
          id="chart-variant"
          value={variant}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              variant: e.target.value as ChartVariant
            })
          }
          options={variantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-column">Category (X-Axis)</Label>
        <Select
          id="category-column"
          value={categoryColumn}
          onChange={(e) =>
            onSettingsChange({ ...settings, categoryColumn: e.target.value })
          }
          options={categoryOptions}
        />
      </div>

      <div className="space-y-3">
        <Label>Value Columns</Label>
        <div className="space-y-2">
          {numericColumns.map((col) => (
            <label
              key={col}
              className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={valueColumns.includes(col)}
                onChange={() => handleValueColumnToggle(col)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">{col}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-muted p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Data Summary:</strong>
          <br />
          {data.rows.length} rows
          <br />
          {numericColumns.length} numeric columns
          <br />
          {categoricalColumns.length} categorical columns
        </p>
      </div>
    </>
  )

  // Drawer variant: no card wrapper, horizontal layout for header
  if (panelVariant === 'drawer') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chart Configuration</h3>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        {configContent}
      </div>
    )
  }

  // Default variant: card wrapper
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Chart Configuration</CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {configContent}
      </CardContent>
    </Card>
  )
}
