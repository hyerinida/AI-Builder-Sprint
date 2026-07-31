import { CardTitle } from './CardTitle'
import { ResultCard } from './ResultCard'

export type FrameAnalysis = {
  originalText: string
  category: string
  description: string
  evidence: string
}

const CATEGORY_LABELS: Record<string, string> = {
  RESPONSIBILITY: '책임귀속',
  RISK: '위험부담',
  DECISION_AUTHORITY: '결정권',
  ACTION_REQUIRED: '행동요구',
  HIDDEN_CONDITION: '숨은조건',
  BENEFIT_LIMITATION: '혜택제한',
}

function DetailField({ label, content }: { label: string; content: string }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[18px] leading-[21px] font-semibold text-ink-700">{label}</p>
      <p className="text-[18px] leading-[21px] font-normal text-ink-700">{content}</p>
    </div>
  )
}

function CategoryField({ category }: { category: string }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[18px] leading-[21px] font-semibold text-ink-700">카테고리</p>
      <span className="inline-flex w-fit items-center rounded-full bg-primary-100 px-3 py-1 text-[16px] leading-[19px] font-semibold text-primary-700">
        #{CATEGORY_LABELS[category] ?? category}
      </span>
    </div>
  )
}

export function FrameAnalysisCard({ frameAnalyses }: { frameAnalyses: FrameAnalysis[] }) {
  return (
    <ResultCard className="flex flex-col gap-[26px] px-6 pt-[26px] pb-9">
      <div className="pl-[10px]">
        <CardTitle bold>프레임 분석</CardTitle>
      </div>
      <div className="flex flex-col gap-9">
        {frameAnalyses.map((item, index) => (
          <div key={index}>
            {index > 0 && <div className="mb-9 border-t border-[#BEBEBE]" />}
            <div className="flex w-full flex-col gap-8 rounded-[7px] bg-[#F2F3F4] px-[17px] py-[18px]">
              <DetailField label="원문" content={item.originalText} />
              <CategoryField category={item.category} />
              <DetailField label="설명" content={item.description} />
              <DetailField label="증거" content={item.evidence} />
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}
