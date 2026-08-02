import { useEffect, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import type { CompletedDocumentAnalysisResponse } from '../api/documents'

const RESULT_TRANSITION_MS = 600

const HEADING_GRADIENT = {
  backgroundImage:
    'linear-gradient(90.2deg, #5DB4F7 -4.5%, #9173CA 26.91%, #132F9C 64.73%, #D6F4F2 105.87%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const

export function AnalyzingPage({
  resultPromise,
  onLogoClick,
  onComplete,
}: {
  resultPromise: Promise<CompletedDocumentAnalysisResponse>
  onLogoClick: () => void
  onComplete: (result: CompletedDocumentAnalysisResponse) => void
}) {
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    resultPromise
      .then((result) => {
        if (cancelled) return
        setIsDone(true)
        setTimeout(() => {
          if (!cancelled) onComplete(result)
        }, RESULT_TRANSITION_MS)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [resultPromise, onComplete])

  return (
    <AppLayout onLogoClick={onLogoClick}>
      <div className="flex flex-col items-center gap-[64px]">
        <div className="flex flex-col items-center gap-[48px]">
          <p style={HEADING_GRADIENT} className="text-[40px] leading-[48px] font-bold">
            {isDone ? '분석이 완료되었어요' : '문서를 간단하게 변환 중이에요'}
          </p>
          {!isDone && !error && (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D6F4F2] border-t-[#132F9C]" />
          )}
        </div>
        {error && (
          <p className="text-[16px] leading-[19px] font-medium text-red-500">
            분석 중 문제가 발생했어요. 다시 시도해주세요.
          </p>
        )}
      </div>
    </AppLayout>
  )
}
