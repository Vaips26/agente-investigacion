'use client'

import { BookOpen, ExternalLink } from 'lucide-react'
import type { Source } from '@/lib/research'

export function AnswerView({
  sources,
  text,
  streaming,
  showSources,
}: {
  sources: Source[]
  text: string
  streaming: boolean
  showSources: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      {showSources && sources.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <BookOpen className="size-3.5" />
            Sources
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
              >
                <p className="line-clamp-2 text-xs leading-relaxed text-foreground">{s.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="flex size-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold uppercase">
                    {s.domain.charAt(0)}
                  </span>
                  <span className="truncate">{s.domain}</span>
                  <ExternalLink className="ml-auto size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {text.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Answer
          </div>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            {text}
            {streaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary align-middle" />
            )}
          </p>
        </section>
      )}
    </div>
  )
}
