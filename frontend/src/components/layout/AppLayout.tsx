import type { ReactNode } from 'react'
import { TrustBadges } from './TrustBadges'
import logo from '../../assets/logo_prism.svg'

const PAGE_BACKGROUND = {
  background:
    'radial-gradient(91.26% 125.11% at 79.55% 72.31%, #F4F4F4 0%, #D5D8EB 30%, #F4F4F4 62%, #E4F5FF 100%)',
}

export function AppLayout({
  onLogoClick,
  children,
}: {
  onLogoClick: () => void
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen justify-center" style={PAGE_BACKGROUND}>
      <button
        type="button"
        onClick={onLogoClick}
        title="Page1로 돌아가기"
        aria-label="Page1로 돌아가기"
        className="fixed top-8 left-7 h-12 w-12 cursor-pointer will-change-transform"
      >
        <img src={logo} alt="" className="h-full w-full" />
      </button>
      <main className="flex w-[824px] min-h-[1024px] flex-col items-center pt-9">
        <h1 className="text-center text-[32px] leading-[38px] font-bold text-ink-900">PRISM</h1>
        <p className="mt-2 text-center text-[20px] leading-[24px] font-medium text-muted">
          문서를 일상 언어로 번역하는 AI
        </p>
        <div className="mt-[164px] w-full">{children}</div>
      </main>
      <TrustBadges />
    </div>
  )
}
