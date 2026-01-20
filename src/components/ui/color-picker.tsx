import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// Tailwind CSS color palette - 600 shades for consistent borders and backgrounds
export const TAILWIND_COLORS_600 = {
  slate: '#475569',
  gray: '#4b5563',
  zinc: '#52525b',
  neutral: '#525252',
  stone: '#57534e',
  red: '#dc2626',
  orange: '#ea580c',
  amber: '#d97706',
  yellow: '#ca8a04',
  lime: '#65a30d',
  green: '#16a34a',
  emerald: '#059669',
  teal: '#0d9488',
  cyan: '#0891b2',
  sky: '#0284c7',
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#9333ea',
  fuchsia: '#c026d3',
  pink: '#db2777',
  rose: '#e11d48'
} as const

export type ColorFamily = keyof typeof TAILWIND_COLORS_600

// Color families ordered for better visual flow
const COLOR_FAMILIES: ColorFamily[] = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose',
  'slate', 'gray', 'zinc', 'neutral', 'stone'
]

interface ColorPickerProps {
  value?: string
  onValueChange?: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onValueChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {COLOR_FAMILIES.map((family) => {
        const hex = TAILWIND_COLORS_600[family]
        const isSelected = value === hex
        return (
          <button
            key={family}
            type="button"
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isSelected ? 'border-foreground' : 'border-transparent'
            )}
            style={{ backgroundColor: hex }}
            onClick={() => onValueChange?.(hex)}
            title={family}
            aria-label={`Select ${family} color`}
          >
            {isSelected && (
              <Check className="h-4 w-4 mx-auto text-white" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// Helper to get a color's name from its hex value
export function getColorName(hex: string): string | null {
  for (const [family, colorHex] of Object.entries(TAILWIND_COLORS_600)) {
    if (colorHex.toLowerCase() === hex.toLowerCase()) {
      return family
    }
  }
  return null
}

// Default colors for chart series (using 600 shades)
export const DEFAULT_CHART_COLORS = [
  TAILWIND_COLORS_600.blue,
  TAILWIND_COLORS_600.emerald,
  TAILWIND_COLORS_600.amber,
  TAILWIND_COLORS_600.rose,
  TAILWIND_COLORS_600.violet,
  TAILWIND_COLORS_600.cyan,
  TAILWIND_COLORS_600.orange,
  TAILWIND_COLORS_600.pink,
  TAILWIND_COLORS_600.teal,
  TAILWIND_COLORS_600.indigo
]

export { TAILWIND_COLORS_600 as tailwindColors }
