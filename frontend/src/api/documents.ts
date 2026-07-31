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

export type DocumentAnalysisResponse = {
  documentId: number
  fileName: string
  documentType: string
  status: string
  parsedMarkdown: string
  analysis: DocumentAnalysis
  errorMessage: string | null
  createdAt: string
}

export async function analyzeDocument(
  file: File,
  documentType = 'CONTRACT',
): Promise<DocumentAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)
  const response = await fetch('/api/documents', { method: 'POST', body: formData })
  if (!response.ok) throw new Error(`문서 분석 요청 실패 (${response.status})`)
  return response.json()
}

export async function getDocument(documentId: number): Promise<DocumentAnalysisResponse> {
  const response = await fetch(`/api/documents/${documentId}`)
  if (!response.ok) throw new Error(`문서 조회 실패 (${response.status})`)
  return response.json()
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
