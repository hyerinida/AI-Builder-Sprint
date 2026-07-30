import { DocumentPreview } from '../components/result/DocumentPreview'
import { FrameAnalysisCard, type FrameAnalysis } from '../components/result/FrameAnalysisCard'
import { RealityTranslationCard, type RealityTranslation } from '../components/result/RealityTranslationCard'
import { ActionGuideCard } from '../components/result/ActionGuideCard'
import { TopBarButton } from '../components/result/TopBarButton'

const PAGE_BACKGROUND = {
  background:
    'radial-gradient(91.26% 125.11% at 79.55% 72.31%, #F4F4F4 0%, #D5D8EB 30%, #F4F4F4 62%, #E4F5FF 100%)',
}

export function ResultPage({
  frameSummary,
  frameAnalyses,
  realityTranslations,
  actionGuide,
  onLogoClick,
}: {
  frameSummary: string
  frameAnalyses: FrameAnalysis[]
  realityTranslations: RealityTranslation[]
  actionGuide: string[]
  onLogoClick: () => void
}) {
  return (
    <div className="relative flex min-h-screen gap-[46px] pt-[63px] pb-[63px] pl-[132px]" style={PAGE_BACKGROUND}>
      <button
        type="button"
        onClick={onLogoClick}
        title="Page1로 돌아가기"
        aria-label="Page1로 돌아가기"
        className="fixed top-8 left-7 h-12 w-12 cursor-pointer bg-[#D9D9D9]"
      />
      <DocumentPreview />
      <div className="flex w-[584px] flex-col gap-[26px]">
        <div className="flex h-9 items-center justify-between">
          <p className="text-[28px] leading-[33px] font-bold text-ink-700">분석 결과</p>
          <div className="flex gap-4">
            <TopBarButton className="h-[52px] w-[52px]">요약</TopBarButton>
            <TopBarButton className="h-[52px] w-[92px]">AI 질문</TopBarButton>
          </div>
        </div>
        <div className="flex max-h-[898px] flex-col gap-[14px] overflow-y-auto overflow-x-hidden">
          <FrameAnalysisCard summary={frameSummary} frameAnalyses={frameAnalyses} />
          <RealityTranslationCard items={realityTranslations} />
          <ActionGuideCard items={actionGuide} />
        </div>
      </div>
    </div>
  )
}
