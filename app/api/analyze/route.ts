import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are a Vercel deployment expert. When given error logs, identify the root cause in 1-2 sentences, provide an exact code or config fix, and give one prevention tip. Be concise and technical.

Format your response EXACTLY as follows with these three sections:

## Root Cause
[1-2 sentence explanation of what went wrong]

## Exact Fix
[Code diff, config change, or specific command to fix the issue. Use code blocks when showing code.]

## Prevention Tip
[One actionable tip to prevent this issue in future deployments]`

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
