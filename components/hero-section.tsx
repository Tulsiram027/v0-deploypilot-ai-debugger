'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Rocket, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  errorLog: string
  onErrorLogChange: (value: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function HeroSection({
  errorLog,
  onErrorLogChange,
  onAnalyze,
  isAnalyzing,
}: HeroSectionProps) {
  return (
    <section className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          DeployPilot
        </h1>
      </div>

      <p className="text-xl text-muted-foreground mb-8 text-balance">
        Paste your error. Get the fix.
      </p>

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Paste your Vercel deployment logs or error messages here..."
            className="min-h-[200px] resize-none font-mono text-sm bg-secondary/50 border-border focus:border-primary"
            value={errorLog}
            onChange={(e) => onErrorLogChange(e.target.value)}
            disabled={isAnalyzing}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {errorLog.length} characters
          </div>
        </div>

        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={!errorLog.trim() || isAnalyzing}
          className="px-8 py-6 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isAnalyzing ? (
            <>
              <Spinner className="mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze
            </>
          )}
        </Button>
      </div>
    </section>
  )
}
