import { CardTitle } from './CardTitle'
import { ResultCard } from './ResultCard'

export function ActionGuideCard({ items }: { items: string[] }) {
  return (
    <ResultCard className="flex flex-col gap-5 px-8 py-6">
      <CardTitle>행동 가이드</CardTitle>
      <ul className="flex flex-col gap-3 pl-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-[11px]">
            <span className="h-2 w-2 shrink-0 border border-ink-700 bg-ink-700" />
            <span className="text-[18px] leading-[21px] font-medium text-ink-700">{item}</span>
          </li>
        ))}
      </ul>
    </ResultCard>
  )
}
