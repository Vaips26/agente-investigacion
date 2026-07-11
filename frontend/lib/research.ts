export type Source = {
  title: string
  url: string
  domain: string
}

export type ResearchResult = {
  steps: string[]
  sources: Source[]
  answer: string
}

export async function research(
  query: string,
  onStep: (step: string) => void,
  onToken: (token: string) => void
): Promise<ResearchResult> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/investigar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pregunta: query }),
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  const steps: string[] = []
  const sources: Source[] = []
  let answer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

    for (const line of lines) {
      try {
        const data = JSON.parse(line.replace('data: ', ''))

        if (data.tipo === 'buscando') {
          const step = `🔍 Buscando: ${data.contenido}`
          steps.push(step)
          onStep(step)
        }

        if (data.tipo === 'texto') {
          answer += data.contenido
          onToken(data.contenido)
        }
      } catch {
        // línea incompleta, ignorar
      }
    }
  }

  return { steps, sources, answer }
}