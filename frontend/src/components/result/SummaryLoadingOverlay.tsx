import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  '핵심 내용을 정리 중입니다...',
  '주의 사항을 살피고 있습니다...',
  '더 도움이 될 답변을 생각 중입니다...',
]

export function SummaryLoadingOverlay() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % LOADING_MESSAGES.length), 1200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(47,55,63,0.3)]">
      <p className="text-[24px] leading-[29px] font-bold text-[#FAFCFF]" style={{ textShadow: '0px 4px 4px rgba(0,0,0,0.5)' }}>
        {LOADING_MESSAGES[index]}
      </p>
    </div>
  )
}
