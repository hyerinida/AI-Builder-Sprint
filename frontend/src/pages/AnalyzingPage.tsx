import { useEffect, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { ChecklistItem } from '../components/analyzing/ChecklistItem'
import {
  analyzeDocument,
  extractInfo,
  analyzeFrames,
  translateToReality,
  summarizeDocument,
  generateActionGuide,
} from '../api/documents'

const STEPS: { labels: string[]; run: (documentId: string) => Promise<unknown> }[] = [
  { labels: ['OCR', '문서 구조 분석'], run: analyzeDocument },
  { labels: ['정보 추출'], run: extractInfo },
  { labels: ['프레임 분석'], run: analyzeFrames },
  { labels: ['현실 번역'], run: translateToReality },
  { labels: ['문서 요약 생성'], run: summarizeDocument },
  { labels: ['행동 가이드 생성'], run: generateActionGuide },
]

const ALL_LABELS = STEPS.flatMap((step) => step.labels)

const HEADING_GRADIENT = {
  backgroundImage:
    'linear-gradient(90.2deg, #5DB4F7 -4.5%, #9173CA 26.91%, #132F9C 64.73%, #D6F4F2 105.87%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const

export function AnalyzingPage({
  documentId,
  onLogoClick,
}: {
  documentId: string
  onLogoClick: () => void
}) {
  const [completedLabels, setCompletedLabels] = useState<string[]>([])
  const [error, setError] = useState(false)
  const isDone = completedLabels.length === ALL_LABELS.length

  useEffect(() => {
    let cancelled = false

    async function run() {
      for (const step of STEPS) {
        try {
          await step.run(documentId)
        } catch {
          if (!cancelled) setError(true)
          return
        }
        if (cancelled) return
        setCompletedLabels((prev) => [...prev, ...step.labels])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [documentId])

  return (
    <AppLayout onLogoClick={onLogoClick}>
      <div className="flex flex-col items-center gap-[64px]">
        <div className="flex flex-col items-center gap-[84px]">
          <p style={HEADING_GRADIENT} className="text-[40px] leading-[48px] font-bold">
            {isDone ? '분석이 완료되었어요' : '문서를 간단하게 변환 중이에요'}
          </p>
          <div className="flex w-[170px] flex-col items-start gap-4">
            {ALL_LABELS.map((label) => (
              <ChecklistItem key={label} label={label} done={completedLabels.includes(label)} />
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
