async function post(path: string, body?: BodyInit) {
  const response = await fetch(`/api/documents${path}`, { method: 'POST', body })
  if (!response.ok) throw new Error(`${path} 요청 실패 (${response.status})`)
  return response
}

export async function uploadDocument(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await post('', formData)
  const data: { documentId: string } = await response.json()
  return data.documentId
}

export function analyzeDocument(documentId: string) {
  return post(`/${documentId}/analyze`)
}

export function extractInfo(documentId: string) {
  return post(`/${documentId}/extract`)
}

export function analyzeFrames(documentId: string) {
  return post(`/${documentId}/frame-analysis`)
}

export function translateToReality(documentId: string) {
  return post(`/${documentId}/reality-translation`)
}

export function summarizeDocument(documentId: string) {
  return post(`/${documentId}/summary`)
}

export function generateActionGuide(documentId: string) {
  return post(`/${documentId}/action-guide`)
}
