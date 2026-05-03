'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Wrench, CheckCircle2 } from 'lucide-react'

interface AnalysisPanelProps {
  result: string
  isStreaming: boolean
}

function parseAnalysis(result: string) {
  const sections = {
    rootCause: '',
    exactFix: '',
    preventionTip: '',
  }

  // Parse the markdown sections
  const rootCauseMatch = result.match(/## Root Cause\s*([\s\S]*?)(?=## Exact Fix|$)/i)
  const exactFixMatch = result.match(/## Exact Fix\s*([\s\S]*?)(?=## Prevention Tip|$)/i)
  const preventionTipMatch = result.match(/## Prevention Tip\s*([\s\S]*?)$/i)

  if (rootCauseMatch) sections.rootCause = rootCauseMatch[1].trim()
  if (exactFixMatch) sections.exactFix = exactFixMatch[1].trim()
  if (preventionTipMatch) sections.preventionTip = preventionTipMatch[1].trim()

  return sections
}

function SkeletonLoader() {
  return (
    <Card className="border-border bg-card animate-pulse">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </CardContent>
    </Card>
  )
}

function AnalysisCard({
  icon: Icon,
  title,
  content,
  delay,
  accentColor,
}: {
  icon: React.ElementType
  title: string
  content: string
  delay: number
  accentColor: string
}) {
  if (!content) return <SkeletonLoader />

  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-4 border-border bg-card"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm prose-invert max-w-none">
          <FormattedContent content={content} />
        </div>
      </CardContent>
    </Card>
  )
}

function FormattedContent({ content }: { content: string }) {
  // Simple markdown-like formatting for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const codeContent = part.replace(/```\w*\n?/g, '').replace(/```$/g, '')
          return (
            <pre
              key={index}
              className="bg-secondary/50 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono"
            >
              <code>{codeContent}</code>
            </pre>
          )
        }

        // Handle inline code
        const inlineCodeParts = part.split(/(`[^`]+`)/g)
        return (
          <span key={index}>
            {inlineCodeParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return (
                  <code
                    key={inlineIndex}
                    className="bg-secondary/50 px-1.5 py-0.5 rounded text-primary text-sm font-mono"
                  >
                    {inlinePart.slice(1, -1)}
                  </code>
                )
              }
              return <span key={inlineIndex}>{inlinePart}</span>
            })}
          </span>
        )
      })}
    </>
  )
}

export function AnalysisPanel({ result, isStreaming }: AnalysisPanelProps) {
  const sections = useMemo(() => parseAnalysis(result), [result])
  const hasContent = sections.rootCause || sections.exactFix || sections.preventionTip

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        Analysis Results
        {isStreaming && (
          <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </h2>

      <div className="grid gap-4">
        <AnalysisCard
          icon={Search}
          title="Root Cause"
          content={sections.rootCause}
          delay={0}
          accentColor="bg-primary/10 text-primary"
        />
        <AnalysisCard
          icon={Wrench}
          title="Exact Fix"
          content={sections.exactFix}
          delay={100}
          accentColor="bg-emerald-500/10 text-emerald-500"
        />
        <AnalysisCard
          icon={CheckCircle2}
          title="Prevention Tip"
          content={sections.preventionTip}
          delay={200}
          accentColor="bg-amber-500/10 text-amber-500"
        />
      </div>
    </section>
  )
}
