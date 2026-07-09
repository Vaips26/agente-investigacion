'use client'

import { Check, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatusIndicator({
  steps,
  currentStep,
  done,
}: {
  steps: string[]
  currentStep: number
  done: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Globe className={cn('size-3.5', !done && 'animate-pulse text-primary')} />
        {done ? 'Research complete' : 'Researching'}
      </div>
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => {
          const isDone = done || i < currentStep
          const isActive = !done && i === currentStep
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-3 text-sm transition-colors',
                isActive
                  ? 'text-foreground'
                  : isDone
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  isDone
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : isActive
                      ? 'border-primary text-primary'
                      : 'border-border text-transparent',
                )}
              >
                {isDone ? (
                  <Check className="size-3" />
                ) : isActive ? (
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </span>
              <span className={cn(isActive && 'font-medium')}>{step}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
