import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Settings } from 'lucide-react'
import { Dropzone } from './-Dropzone'
import { ChartDisplay } from './-ChartDisplay'
import { ConfigPanel } from './-ConfigPanel'
import { parseFile } from '@/lib/file-parser'
import { saveState, loadState, clearState } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { ParsedData, ChartSettings } from '@/types'

export const Route = createFileRoute('/charter/')({
  component: CharterPage,
})

const DEFAULT_SETTINGS: ChartSettings = {
  type: 'bar',
  variant: 'default',
  categoryColumn: '',
  valueColumns: []
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const media = window.matchMedia(query)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

function CharterPage() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [chartSettings, setChartSettings] = useState<ChartSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Use lg breakpoint (1024px) for mobile/tablet detection
  const isDesktop = useMediaQuery('(min-width: 1024px)')

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
    setDrawerOpen(false)
  }, [])

  // Show dropzone if no data
  if (!parsedData) {
    return (
      <div className="h-[calc(100vh-3.5rem)]">
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

  // Desktop layout: side-by-side grid
  if (isDesktop) {
    return (
      <div className="h-[calc(100vh-3.5rem)] p-6">
        <div className="grid h-full grid-cols-3 gap-6">
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

  // Mobile/Tablet layout: full-width chart with drawer for config
  return (
    <div className="h-[calc(100vh-3.5rem)] p-4">
      <div className="h-full">
        <ChartDisplay data={parsedData} settings={chartSettings} />
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
          >
            <Settings className="h-6 w-6" />
            <span className="sr-only">Open chart settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Chart Configuration</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ConfigPanel
              data={parsedData}
              settings={chartSettings}
              onSettingsChange={handleSettingsChange}
              onReset={handleReset}
              variant="drawer"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
