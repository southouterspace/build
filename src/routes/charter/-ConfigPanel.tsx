import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { ColorPicker, DEFAULT_CHART_COLORS } from '@/components/ui/color-picker'
import { RotateCcw } from 'lucide-react'
import type { ChartType, ChartVariant, ChartSettings, ParsedData, DisplayMode } from '@/types'
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
  const { type, variant, categoryColumn, valueColumns, columnColors, displayMode } = settings
  const { numericColumns, categoricalColumns, headers } = data

  const [colorDrawerOpen, setColorDrawerOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)

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

  const displayModeOptions = [
    { value: 'combined', label: 'Combined Chart' },
    { value: 'cards', label: 'Individual Cards' }
  ]

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

  const getColumnColor = (column: string, index: number): string => {
    return columnColors[column] || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
  }

  const handleColorChange = (column: string, color: string) => {
    onSettingsChange({
      ...settings,
      columnColors: {
        ...columnColors,
        [column]: color
      }
    })
  }

  const openColorPicker = (column: string) => {
    setSelectedColumn(column)
    setColorDrawerOpen(true)
  }

  const configContent = (
    <>
      <Field>
        <FieldLabel htmlFor="chart-type">Chart Type</FieldLabel>
        <Select
          id="chart-type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ChartType)}
          options={chartTypeOptions}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="chart-variant">Variant</FieldLabel>
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
      </Field>

      <Field>
        <FieldLabel htmlFor="display-mode">Display Mode</FieldLabel>
        <Select
          id="display-mode"
          value={displayMode}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              displayMode: e.target.value as DisplayMode
            })
          }
          options={displayModeOptions}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="category-column">Category (X-Axis)</FieldLabel>
        <Select
          id="category-column"
          value={categoryColumn}
          onChange={(e) =>
            onSettingsChange({ ...settings, categoryColumn: e.target.value })
          }
          options={categoryOptions}
        />
      </Field>

      <Field>
        <FieldLabel>Value Columns</FieldLabel>
        <FieldDescription>
          Select columns to display and click the color to customize
        </FieldDescription>
        <div className="space-y-2 pt-1">
          {numericColumns.map((col, index) => {
            const isSelected = valueColumns.includes(col)
            const columnIndex = valueColumns.indexOf(col)
            const color = getColumnColor(col, columnIndex >= 0 ? columnIndex : index)

            return (
              <div
                key={col}
                className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleValueColumnToggle(col)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{col}</span>
                </label>
                {isSelected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => openColorPicker(col)}
                    title={`Change color for ${col}`}
                    aria-label={`Change color for ${col}`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Field>

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

      <Drawer open={colorDrawerOpen} onOpenChange={setColorDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Choose Color for "{selectedColumn}"</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {selectedColumn && (
              <ColorPicker
                value={columnColors[selectedColumn]}
                onValueChange={(color) => {
                  handleColorChange(selectedColumn, color)
                  setColorDrawerOpen(false)
                }}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
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
