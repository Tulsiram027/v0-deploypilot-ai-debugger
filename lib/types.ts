export interface AnalysisHistory {
  id: string
  errorPreview: string
  timestamp: number
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}
