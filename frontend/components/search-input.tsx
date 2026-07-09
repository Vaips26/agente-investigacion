'use client'

import { useState } from 'react'
import { ArrowUp, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchInput({
  onSubmit,
  busy,
  large,
  placeholder = 'Ask anything…',
}: {
  onSubmit: (query: string) => void
  busy: boolean
  large?: boolean
  placeholder?: string
}) {
  const [value, setValue] = useState('')

  function submit() {
    const q = value.trim()
    if (!q || busy) return
    onSubmit(q)
    setValue('')
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-sm transition-colors focus-within:border-primary/60',
        large ? 'py-3.5' : 'py-2.5',
      )}
    >
      <Search className="size-5 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        aria-label="Search query"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none',
          large ? 'text-base' : 'text-sm',
        )}
      />
      <button
        onClick={submit}
        disabled={busy || value.trim().length === 0}
        aria-label="Submit search"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
      </button>
    </div>
  )
}
