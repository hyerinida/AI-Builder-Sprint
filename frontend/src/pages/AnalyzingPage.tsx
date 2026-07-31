import { useEffect, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { ChecklistItem } from '../components/analyzing/ChecklistItem'
import { analyzeDocument, type DocumentAnalysisResponse } from '../api/documents'

const LABELS = ['OCR 및 문서 구조 분석', '프레임 분석', '현실 번역', '문서 요약 생성', '행동 가이드 생성']
const STEP_INTERVAL_MS = 900
const RESULT_TRANSITION_MS = 600

const HEADING_GRADIENT = {
  backgroundImage:
    'linear-gradient(90.2deg, #5DB4F7 -4.5%, #9173CA 26.91%, #132F9C 64.73%, #D6F4F2 105.87%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const

export function AnalyzingPage({
  file,
  onLogoClick,
  onComplete,
}: {
  file: File
  onLogoClick: () => void
  onComplete: (result: DocumentAnalysisResponse) => void
}) {
  const [completedCount, setCompletedCount] = useState(0)
  const [error, setError] = useState(false)
  const isDone = completedCount === LABELS.length

  useEffect(() => {
    let cancelled = false

    const timer = setInterval(() => {
      setCompletedCount((prev) => (prev < LABELS.length - 1 ? prev + 1 : prev))
    }, STEP_INTERVAL_MS)

    analyzeDocument(file)
      .then((result) => {
        if (cancelled) return
        clearInterval(timer)
        setCompletedCount(LABELS.length)
        setTimeout(() => {
          if (!cancelled) onComplete(result)
        }, RESULT_TRANSITION_MS)
      })
      .catch(() => {
        if (cancelled) return
        clearInterval(timer)
        setError(true)
      })

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [file, onComplete])

  return (
    <AppLayout onLogoClick={onLogoClick}>
      <div className="flex flex-col items-center gap-[64px]">
        <div className="flex flex-col items-center gap-[84px]">
          <p style={HEADING_GRADIENT} className="text-[40px] leading-[48px] font-bold">
            {isDone ? '분석이 완료되었어요' : '문서를 간단하게 변환 중이에요'}
          </p>
          <div className="flex w-[170px] flex-col items-start gap-4">
            {LABELS.map((label, index) => (
              <ChecklistItem key={label} label={label} done={index < completedCount} />
            ))}
          </div>
        </div>
        {error ? (
          <p className="text-[16px] leading-[19px] font-medium text-red-500">
            분석 중 문제가 발생했어요. 다시 시도해주세요.
          </p>
        ) : (
          <p className="text-[16px] leading-[19px] font-medium text-muted">
            업로드된 문서는 분석 완료 후 서버에 저장되지 않고 즉시 영구 삭제됩니다.
          </p>
        )}
      </div>
    </AppLayout>
  )
}
