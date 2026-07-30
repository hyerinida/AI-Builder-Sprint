import { useState } from 'react'
import { UploadPage } from './pages/UploadPage'
import { AnalyzingPage } from './pages/AnalyzingPage'
import { uploadDocument } from './api/documents'

type Stage = { name: 'upload' } | { name: 'analyzing'; documentId: string }

function App() {
  const [stage, setStage] = useState<Stage>({ name: 'upload' })

  async function handleAnalyze(file: File) {
    try {
      const documentId = await uploadDocument(file)
      setStage({ name: 'analyzing', documentId })
    } catch (error) {
      console.error('문서 업로드 실패', error)
    }
  }

  if (stage.name === 'analyzing') {
    return <AnalyzingPage documentId={stage.documentId} onLogoClick={() => setStage({ name: 'upload' })} />
  }

  return <UploadPage onAnalyze={handleAnalyze} />
}

export default App
