import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { Button } from '@/client/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/client/components/ui/popover'
import { usePalette, useTheme } from '@/client/components/theme-provider'
import { cn } from '@/client/lib/utils'

const MODE_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

export function PaletteSwitcher() {
  const { palette, setPalette, palettes } = usePalette()
  const { theme, setTheme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 glass">
          <div className="flex -space-x-1">
            {palettes
              .find(p => p.id === palette)
              ?.colors.map((color, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full ring-1 ring-white/20"
                  style={{ background: color }}
                />
              ))}
          </div>
          <span className="hidden sm:inline text-xs">
            {palettes.find(p => p.id === palette)?.name}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 space-y-3">
        {/* Palette grid */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Palette
          </p>
          <div className="grid grid-cols-1 gap-1">
            {palettes.map(p => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                  'hover:bg-accent/50',
                  palette === p.id && 'bg-accent'
                )}
              >
                <div className="flex -space-x-1 shrink-0">
                  {p.colors.map((color, i) => (
                    <span
                      key={i}
                      className="size-4 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.description}</p>
                </div>
                {palette === p.id && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mode
          </p>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {MODE_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  theme === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
