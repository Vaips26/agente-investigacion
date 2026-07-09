'use client'

import { Search, Plus, Sparkles, Compass, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type HistoryItem = {
  id: string
  query: string
}

export function Sidebar({
  history,
  activeId,
  onSelect,
  onNew,
}: {
  history: HistoryItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Athena</span>
      </div>

      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-accent"
        >
          <Plus className="size-4" />
          New thread
        </button>
      </div>

      <nav className="mt-4 px-3">
        <NavItem icon={<Search className="size-4" />} label="Search" active />
        <NavItem icon={<Compass className="size-4" />} label="Discover" />
      </nav>

      <div className="mt-6 flex items-center gap-2 px-5 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Clock className="size-3.5" />
        History
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {history.length === 0 ? (
          <p className="px-2 py-2 text-sm leading-relaxed text-muted-foreground">
            Your recent searches will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'w-full truncate rounded-lg px-2 py-2 text-left text-sm transition-colors',
                    item.id === activeId
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  )}
                  title={item.query}
                >
                  {item.query}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
            R
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Researcher</p>
            <p className="truncate text-xs text-muted-foreground">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
        active
          ? 'font-medium text-sidebar-foreground'
          : 'text-muted-foreground hover:text-sidebar-foreground',
      )}
    >
      {icon}
      {label}
    </div>
  )
}
