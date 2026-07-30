import { useState } from 'react'
import { CardTitle } from './CardTitle'
import { ResultCard } from './ResultCard'

export type FrameAnalysis = {
  originalText: string
  category: string
  interpretation: string
}

export function FrameAnalysisCard({
  summary,
  frameAnalyses,
}: {
  summary: string
  frameAnalyses: FrameAnalysis[]
}) {
  const [expanded, setExpanded] = useState(false)
  const detail = frameAnalyses.map((item) => item.interpretation).join(' ')

  return (
    <ResultCard className="flex flex-col gap-[9px] px-8 py-[26px]">
      <div className="flex flex-col gap-[14px]">
        <CardTitle>프레임 분석</CardTitle>
        <p className={`text-[18px] leading-[21px] font-medium text-ink-700 ${expanded ? 'leading-[25px]' : 'truncate'}`}>
          {expanded ? detail : summary}
        </p>
      </div>
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cursor-pointer self-end text-[12px] leading-[14px] font-medium text-[#7A7A7A]"
        >
          더보기
        </button>
      )}
    </ResultCard>
  )
}
