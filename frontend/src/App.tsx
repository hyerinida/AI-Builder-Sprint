import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { UploadPage } from './pages/UploadPage'
import { AnalyzingPage } from './pages/AnalyzingPage'
import { ResultPage } from './pages/ResultPage'
import {
  analyzeDocument,
  getDocument,
  sendChatMessage,
  type CompletedDocumentAnalysisResponse,
} from './api/documents'

type Stage =
  | { name: 'upload' }
  | { name: 'restoring'; documentId: number }
  | { name: 'analyzing'; file: File; resultPromise: Promise<CompletedDocumentAnalysisResponse> }
  | { name: 'result'; data: CompletedDocumentAnalysisResponse; file?: File }

function getDocumentIdFromUrl(): number | null {
  const raw = new URLSearchParams(window.location.search).get('document')
  const id = raw ? Number(raw) : NaN
  return Number.isFinite(id) ? id : null
}

function setDocumentIdInUrl(documentId: number | null) {
  const url = new URL(window.location.href)
  if (documentId === null) {
    url.searchParams.delete('document')
  } else {
    url.searchParams.set('document', String(documentId))
  }
  window.history.pushState({}, '', url)
}

function App() {
  const [stage, setStage] = useState<Stage>(() => {
    const documentId = getDocumentIdFromUrl()
    return documentId === null ? { name: 'upload' } : { name: 'restoring', documentId }
  })

  useEffect(() => {
    if (stage.name !== 'restoring') return
    let cancelled = false

    getDocument(stage.documentId)
      .then((data) => {
        if (!cancelled) setStage({ name: 'result', data })
      })
      .catch(() => {
        if (cancelled) return
        setDocumentIdInUrl(null)
        setStage({ name: 'upload' })
      })

    return () => {
      cancelled = true
    }
  }, [stage])

  function goToUpload() {
    setDocumentIdInUrl(null)
    setStage({ name: 'upload' })
  }

  if (stage.name === 'restoring') {
    return (
      <AppLayout onLogoClick={goToUpload}>
        <p className="text-center text-[16px] leading-[19px] font-medium text-muted">불러오는 중...</p>
      </AppLayout>
    )
  }

  if (stage.name === 'analyzing') {
    return (
      <AnalyzingPage
        resultPromise={stage.resultPromise}
        onLogoClick={goToUpload}
        onComplete={(data) => {
          setDocumentIdInUrl(data.documentId)
          setStage({ name: 'result', data, file: stage.file })
        }}
      />
    )
  }

  if (stage.name === 'result') {
    const { documentId, analysis } = stage.data
    return (
      <ResultPage
        onLogoClick={goToUpload}
        file={stage.file}
        frameAnalyses={analysis.frameAnalyses}
        realityTranslations={analysis.realityTranslations}
        actionGuide={analysis.actionGuides.map((guide) => guide.item)}
        documentSummary={analysis.documentSummary}
        onSendMessage={(message) => sendChatMessage(documentId, message)}
      />
    )
  }

  return (
    <UploadPage
      onAnalyze={(file) => setStage({ name: 'analyzing', file, resultPromise: analyzeDocument(file) })}
    />
  )
}

export default App
