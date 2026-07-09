'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Sidebar, type HistoryItem } from '@/components/sidebar'
import { SearchInput } from '@/components/search-input'
import { StatusIndicator } from '@/components/status-indicator'
import { AnswerView } from '@/components/answer-view'
import { research, type ResearchResult } from '@/lib/research'

type Session = ResearchResult & { query: string }
type Phase = 'idle' | 'searching' | 'writing' | 'done'

const EXAMPLES = [
  'How does quantum computing actually work?',
  'What is the latest on climate change and carbon emissions?',
  'Explain how large language models are trained',
  'What are the health benefits of intermittent fasting?',
]

export default function Page() {
  const [sessions, setSessions] = useState<Record<string, Session>>({})
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [streamed, setStreamed] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [streamed, phase])

  const busy = phase === 'searching' || phase === 'writing'

  async function startResearch(query: string) {
    if (busy) return

    const id = crypto.randomUUID()

    setHistory((prev) => [{ id, query }, ...prev])
    setActiveId(id)
    setPhase('searching')
    setCurrentStep(0)
    setStreamed('')

    setSessions((prev) => ({
      ...prev,
      [id]: {
        query,
        steps: [],
        sources: [],
        answer: '',
      },
    }))

    let stepIndex = 0
    let fullAnswer = ''

    const result = await research(
      query,
      (step) => {
        setSessions((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            steps: [...(prev[id]?.steps || []), step],
          },
        }))
        setCurrentStep(stepIndex++)
      },
      (token) => {
        setPhase('writing')
        fullAnswer += token
        setStreamed(fullAnswer)
      },
    )

    setSessions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        answer: result.answer,
      },
    }))

    setPhase('done')
  }

  function selectHistory(id: string) {
    const s = sessions[id]
    if (!s) return

    setActiveId(id)
    setPhase('done')
    setCurrentStep(s.steps.length)
    setStreamed(s.answer)
  }

  function newThread() {
    setActiveId(null)
    setPhase('idle')
    setCurrentStep(0)
    setStreamed('')
  }

  const active = activeId ? sessions[activeId] : null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        history={history}
        activeId={activeId}
        onSelect={selectHistory}
        onNew={newThread}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Sparkles className="size-6" />
                </div>

                <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
                  What do you want to know?
                </h1>

                <p className="mt-2 text-pretty text-muted-foreground">
                  Athena searches the web in real time and answers with cited
                  sources.
                </p>
              </div>

              <SearchInput
                onSubmit={startResearch}
                busy={busy}
                large
              />

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => startResearch(ex)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
            >
              <div className="mx-auto w-full max-w-3xl px-6 py-8">
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
                  {active.query}
                </h1>

                <div className="mt-6 flex flex-col gap-6">
                  {phase !== 'done' && (
                    <StatusIndicator
                      steps={active.steps}
                      currentStep={currentStep}
                      done={false}
                    />
                  )}

                  <AnswerView
                    sources={active.sources}
                    text={phase === 'done' ? streamed || active.answer : streamed}
                    streaming={phase === 'writing'}
                    showSources={phase === 'writing' || phase === 'done'}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-background/80 px-6 py-4 backdrop-blur">
              <div className="mx-auto w-full max-w-3xl">
                <SearchInput
                  onSubmit={startResearch}
                  busy={busy}
                  placeholder="Ask a follow-up…"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}