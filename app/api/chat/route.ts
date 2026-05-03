import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are a Vercel deployment expert continuing a conversation about a deployment error. The user has already received an initial analysis and may have follow-up questions. Be concise, technical, and helpful. Adapt your answers to different package managers, languages, or frameworks when asked.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-6',
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
