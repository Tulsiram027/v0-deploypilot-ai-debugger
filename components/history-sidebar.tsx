'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AnalysisHistory } from '@/lib/types'

interface HistorySidebarProps {
  history: AnalysisHistory[]
  onSelect: (entry: AnalysisHistory) => void
  onClear: () => void
  isOpen: boolean
  onToggle: () => void
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function HistorySidebar({
  history,
  onSelect,
  onClear,
  isOpen,
  onToggle,
}: HistorySidebarProps) {
  return (
    <>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={`fixed top-4 z-50 transition-all duration-300 ${
          isOpen ? 'left-[252px]' : 'left-4'
        } bg-secondary/80 hover:bg-secondary border border-border`}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-sidebar-primary" />
              <h2 className="font-semibold text-sidebar-foreground">History</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your last 5 analyses
            </p>
          </div>

          <ScrollArea className="flex-1 p-4">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-accent mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No analyses yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onSelect(entry)}
                    className="w-full text-left p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors group"
                  >
                    <p className="text-sm text-sidebar-foreground font-mono truncate">
                      {entry.errorPreview.split('\n')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {history.length > 0 && (
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
