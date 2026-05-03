'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { MessageCircle, Send } from 'lucide-react'

interface ChatFollowUpProps {
  initialError: string
  initialAnalysis: string
  analysisId: string | null
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('')
}

export function ChatFollowUp({ initialError, initialAnalysis, analysisId }: ChatFollowUpProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    id: analysisId || undefined,
    initialMessages: [
      {
        id: 'initial-error',
        role: 'user',
        parts: [{ type: 'text', text: `Original error:\n${initialError}` }],
      },
      {
        id: 'initial-analysis',
        role: 'assistant',
        parts: [{ type: 'text', text: initialAnalysis }],
      },
    ],
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  // Only show messages after the initial context (skip first 2)
  const displayMessages = messages.slice(2)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          Follow-up Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayMessages.length > 0 && (
          <ScrollArea className="h-[200px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <FormattedChatContent content={getMessageText(message)} />
                  </div>
                </div>
              ))}
              {isLoading && displayMessages[displayMessages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg px-4 py-2">
                    <Spinner className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question... (e.g., What if I'm using pnpm?)"
            disabled={isLoading}
            className="flex-1 bg-secondary/50 border-border focus:border-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Ask about different package managers, frameworks, or deployment scenarios
        </p>
      </CardContent>
    </Card>
  )
}

function FormattedChatContent({ content }: { content: string }) {
  // Handle inline code
  const parts = content.split(/(`[^`]+`)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
