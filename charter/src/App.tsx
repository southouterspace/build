import { useState, useEffect, useCallback } from 'react'
import { Dropzone } from '@/components/Dropzone'
import { ChartDisplay } from '@/components/ChartDisplay'
import { ConfigPanel } from '@/components/ConfigPanel'
import { parseFile } from '@/lib/file-parser'
import { saveState, loadState, clearState } from '@/lib/storage'
import type { ParsedData, ChartSettings } from '@/types'
import './index.css'

const DEFAULT_SETTINGS: ChartSettings = {
  type: 'bar',
  variant: 'default',
  categoryColumn: '',
  valueColumns: []
}

function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [chartSettings, setChartSettings] = useState<ChartSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load state from session storage on mount
  useEffect(() => {
    const savedState = loadState()
    if (savedState) {
      setParsedData(savedState.parsedData)
      setChartSettings(savedState.chartSettings)
    }
  }, [])

  // Save state to session storage when it changes
  useEffect(() => {
    if (parsedData) {
      saveState({ parsedData, chartSettings })
    }
  }, [parsedData, chartSettings])

  const handleFileAccepted = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await parseFile(file)

      // Auto-configure settings based on parsed data
      const categoryColumn =
        data.categoricalColumns[0] || data.headers[0]
      const valueColumns =
        data.numericColumns.length > 0
          ? [data.numericColumns[0]]
          : []

      const newSettings: ChartSettings = {
        type: 'bar',
        variant: 'default',
        categoryColumn,
        valueColumns
      }

      setParsedData(data)
      setChartSettings(newSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSettingsChange = useCallback((newSettings: ChartSettings) => {
    setChartSettings(newSettings)
  }, [])

  const handleReset = useCallback(() => {
    setParsedData(null)
    setChartSettings(DEFAULT_SETTINGS)
    setError(null)
    clearState()
  }, [])

  // Show dropzone if no data
  if (!parsedData) {
    return (
      <div className="min-h-screen">
        <Dropzone onFileAccepted={handleFileAccepted} isLoading={isLoading} />
        {error && (
          <div className="fixed bottom-6 left-6 right-6 rounded-lg bg-destructive p-4 text-destructive-foreground shadow-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    )
  }

  // Show chart view with config panel
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="grid h-[calc(100vh-3rem)] grid-cols-3 gap-6">
        <div className="col-span-2">
          <ChartDisplay data={parsedData} settings={chartSettings} />
        </div>
        <div className="col-span-1">
          <ConfigPanel
            data={parsedData}
            settings={chartSettings}
            onSettingsChange={handleSettingsChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}

export default App
