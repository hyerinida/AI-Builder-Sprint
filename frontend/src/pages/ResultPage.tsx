import { useState } from 'react'
import { DocumentPreview } from '../components/result/DocumentPreview'
import { FrameAnalysisCard, type FrameAnalysis } from '../components/result/FrameAnalysisCard'
import { RealityTranslationCard, type RealityTranslation } from '../components/result/RealityTranslationCard'
import { ActionGuideCard } from '../components/result/ActionGuideCard'
import { TopBarButton } from '../components/result/TopBarButton'
import { ChatOverlay, type ChatMessage } from '../components/result/ChatOverlay'
import { SummaryConfirmModal } from '../components/result/SummaryConfirmModal'
import { SummaryLoadingOverlay } from '../components/result/SummaryLoadingOverlay'

const PAGE_BACKGROUND = {
  background:
    'radial-gradient(91.26% 125.11% at 79.55% 72.31%, #F4F4F4 0%, #D5D8EB 30%, #F4F4F4 62%, #E4F5FF 100%)',
}

const SUMMARY_LOADING_MS = 3600

export function ResultPage({
  frameSummary,
  frameAnalyses,
  realityTranslations,
  actionGuide,
  documentSummary,
  onLogoClick,
  onSendMessage,
}: {
  frameSummary: string
  frameAnalyses: FrameAnalysis[]
  realityTranslations: RealityTranslation[]
  actionGuide: string[]
  documentSummary: string
  onLogoClick: () => void
  onSendMessage: (message: string) => Promise<string>
}) {
  const [view, setView] = useState<'result' | 'summary'>('result')
  const [summaryFlow, setSummaryFlow] = useState<'idle' | 'confirm' | 'loading'>('idle')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  async function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: 'user', text }])
    const reply = await onSendMessage(text)
    setMessages((prev) => [...prev, { role: 'ai', text: reply }])
  }

  function handleConfirmSummary() {
    setSummaryFlow('loading')
    setTimeout(() => {
      setSummaryFlow('idle')
      setView('summary')
    }, SUMMARY_LOADING_MS)
  }

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
      <div className="flex w-[584px] flex-col">
        {view === 'result' ? (
          <div className="flex flex-col gap-[26px]">
            <div className="flex h-9 items-center justify-between">
              <p className="text-[28px] leading-[33px] font-semibold text-ink-700">분석 결과</p>
              <div className="flex gap-4">
                <TopBarButton className="h-[52px] w-[52px]" onClick={() => setSummaryFlow('confirm')}>
                  요약
                </TopBarButton>
                <TopBarButton className="h-[52px] w-[92px]" active={isChatOpen} onClick={() => setIsChatOpen(true)}>
                  AI 질문
                </TopBarButton>
              </div>
            </div>
            <div
              className="flex max-h-[898px] flex-col gap-[14px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              <FrameAnalysisCard summary={frameSummary} frameAnalyses={frameAnalyses} />
              <RealityTranslationCard items={realityTranslations} />
              <ActionGuideCard items={actionGuide} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[76px]">
            <div className="flex h-9 items-center gap-36 pl-[46px]">
              <p className="text-[28px] leading-[33px] font-semibold text-ink-700">문서 요약</p>
              <div className="flex gap-4">
                <TopBarButton className="h-[52px] w-[181px]" onClick={() => setView('result')}>
                  분석 결과로 돌아가기
                </TopBarButton>
                <TopBarButton className="h-[52px] w-[92px]" active={isChatOpen} onClick={() => setIsChatOpen(true)}>
                  AI 질문
                </TopBarButton>
              </div>
            </div>
            <div className="ml-[42px] flex max-h-[898px] w-[514px] flex-col gap-[14px] overflow-y-auto overflow-x-hidden">
              <p className="text-[18px] leading-9 font-normal text-ink-700">{documentSummary}</p>
            </div>
          </div>
        )}
      </div>
      {summaryFlow === 'confirm' && (
        <SummaryConfirmModal onCancel={() => setSummaryFlow('idle')} onConfirm={handleConfirmSummary} />
      )}
      {summaryFlow === 'loading' && <SummaryLoadingOverlay />}
      {isChatOpen && (
        <ChatOverlay messages={messages} onSend={handleSend} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  )
}
