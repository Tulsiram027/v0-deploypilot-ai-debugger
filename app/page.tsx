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

  const handleAnalyze = () => {
    if (!errorLog.trim() || isAnalyzing) return

    const analysisId = Date.now().toString()
    setCurrentAnalysisId(analysisId)

    // Mock response for demo purposes
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

    // Immediately set the analysis result
    setAnalysisResult(mockResponse)

    // Save to history
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
