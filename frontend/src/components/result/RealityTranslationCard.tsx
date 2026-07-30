import { CardTitle } from './CardTitle'
import { ResultCard } from './ResultCard'

function ArrowDownIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="#000000">
      <path d="M6 16 0 8h4V0h4v8h4z" />
    </svg>
  )
}

function DetailBox({ label, content }: { label: string; content: string }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[7px] bg-[#F2F3F4] px-[17px] py-[18px]">
      <p className="text-[18px] leading-[21px] font-semibold text-ink-700">{label}</p>
      <p className="text-[18px] leading-[21px] font-normal text-ink-700">{content}</p>
    </div>
  )
}

export type RealityTranslation = {
  originalText: string
  easyWords: string
  realWorldImpact: string
}

export function RealityTranslationCard({ items }: { items: RealityTranslation[] }) {
  const item = items[0]

  return (
    <ResultCard className="flex flex-col gap-[10px] px-6 pt-[26px] pb-9">
      <div className="flex flex-col gap-[26px]">
        <div className="pl-[10px]">
          <CardTitle bold>현실 번역</CardTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-3">
          <DetailBox label="원문" content={item.originalText} />
          <ArrowDownIcon />
          <DetailBox label="쉬운 말" content={item.easyWords} />
          <ArrowDownIcon />
          <DetailBox label="실제 발생 가능한 상황" content={item.realWorldImpact} />
        </div>
      </div>
    </ResultCard>
  )
}
