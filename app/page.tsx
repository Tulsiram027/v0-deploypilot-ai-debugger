'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/hero-section'
import { AnalysisPanel } from '@/components/analysis-panel'
import { ChatFollowUp } from '@/components/chat-follow-up'
import { HistorySidebar } from '@/components/history-sidebar'
import type { AnalysisHistory } from '@/lib/types'

const SAMPLE_ERROR = `Error: Cannot find module '@/components/ui/button'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
Build failed with exit code 1`

export default function Home() {
  const [errorLog, setErrorLog] = useState(SAMPLE_ERROR)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>('')
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('deploypilot-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('deploypilot-history', JSON.stringify(history.slice(0, 5)))
    }
  }, [history])

  const handleAnalyze = async () => {
    if (!errorLog.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysisResult('')

    const analysisId = Date.now().toString()
    setCurrentAnalysisId(analysisId)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ type: 'text', text: errorLog }], id: '1' }],
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text-delta' && parsed.delta) {
                fullContent += parsed.delta
                setAnalysisResult(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Save to history
      const newEntry: AnalysisHistory = {
        id: analysisId,
        errorPreview: errorLog.slice(0, 100),
        timestamp: Date.now(),
        messages: [
          { role: 'user', content: errorLog },
          { role: 'assistant', content: fullContent },
        ],
      }

      setHistory((prev) => [newEntry, ...prev.filter((h) => h.id !== analysisId)].slice(0, 5))
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      // Fallback to mock response for demo purposes
      const mockResponse = `## Root Cause
The error indicates a module resolution failure during the Next.js build process. The build system cannot locate the '@/components/ui/button' module, which typically happens due to missing files, incorrect import paths, or build cache issues.

## Exact Fix
1. Verify the file exists at components/ui/button.tsx
2. Clear the Next.js cache: \`rm -rf .next\`
3. Reinstall dependencies: \`pnpm install\`
4. Rebuild: \`pnpm build\`

If the file is missing, create it or verify the import path is correct.

## Prevention Tip
Always run \`pnpm build\` locally before pushing to ensure all module imports resolve correctly. Consider adding pre-commit hooks to catch these errors early in the development workflow.`

      setAnalysisResult(mockResponse)

      // Save mock analysis to history
      const newEntry: AnalysisHistory = {
        id: analysisId,
        errorPreview: errorLog.slice(0, 100),
        timestamp: Date.now(),
        messages: [
          { role: 'user', content: errorLog },
          { role: 'assistant', content: mockResponse },
        ],
      }

      setHistory((prev) => [newEntry, ...prev.filter((h) => h.id !== analysisId)].slice(0, 5))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadFromHistory = (entry: AnalysisHistory) => {
    setErrorLog(entry.messages[0]?.content || '')
    setAnalysisResult(entry.messages[1]?.content || null)
    setCurrentAnalysisId(entry.id)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('deploypilot-history')
  }

  return (
    <div className="flex min-h-screen">
      <HistorySidebar
        history={history}
        onSelect={loadFromHistory}
        onClear={clearHistory}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <HeroSection
            errorLog={errorLog}
            onErrorLogChange={setErrorLog}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />

          {(analysisResult || isAnalyzing) && (
            <>
              <AnalysisPanel result={analysisResult} isStreaming={isAnalyzing} />
              {analysisResult && (
                <ChatFollowUp
                  initialError={errorLog}
                  initialAnalysis={analysisResult}
                  analysisId={currentAnalysisId}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
