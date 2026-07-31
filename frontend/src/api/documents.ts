export type FrameAnalysisItem = {
  originalText: string
  category: string
  description: string
  evidence: string
}

export type RealityTranslationItem = {
  originalText: string
  easyWords: string
  realWorldImpact: string
}

export type ActionGuideItem = {
  item: string
  description: string
}

export type DocumentAnalysis = {
  documentType: string
  documentSummary: string
  frameSummary: string
  frameAnalyses: FrameAnalysisItem[]
  realityTranslations: RealityTranslationItem[]
  actionGuides: ActionGuideItem[]
}

export type DocumentStatus = 'PARSING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'

export type DocumentAnalysisResponse = {
  documentId: number
  fileName: string
  documentType: string
  status: DocumentStatus
  parsedMarkdown: string
  analysis: DocumentAnalysis | null
  errorMessage: string | null
  createdAt: string
}

export type CompletedDocumentAnalysisResponse = DocumentAnalysisResponse & { analysis: DocumentAnalysis }

function assertCompleted(data: DocumentAnalysisResponse): asserts data is CompletedDocumentAnalysisResponse {
  if (data.status !== 'COMPLETED' || data.analysis === null) {
    throw new Error(data.errorMessage ?? '문서 분석에 실패했습니다.')
  }
}

export async function analyzeDocument(file: File): Promise<CompletedDocumentAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/documents', { method: 'POST', body: formData })
  if (!response.ok) throw new Error(`문서 분석 요청 실패 (${response.status})`)
  const data: DocumentAnalysisResponse = await response.json()
  assertCompleted(data)
  return data
}

export async function getDocument(documentId: number): Promise<CompletedDocumentAnalysisResponse> {
  const response = await fetch(`/api/documents/${documentId}`)
  if (!response.ok) throw new Error(`문서 조회 실패 (${response.status})`)
  const data: DocumentAnalysisResponse = await response.json()
  assertCompleted(data)
  return data
}

export async function sendChatMessage(documentId: number, question: string): Promise<string> {
  const response = await fetch(`/api/documents/${documentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!response.ok) throw new Error(`질문 요청 실패 (${response.status})`)
  const data: { answer: string } = await response.json()
  return data.answer
}
