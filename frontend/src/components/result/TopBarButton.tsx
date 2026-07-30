import type { ReactNode } from 'react'

export function TopBarButton({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-[40px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.2)] text-[16px] leading-[19px] font-medium text-primary-700 shadow-[1px_2px_8px_rgba(47,55,63,0.2)] transition-colors hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.3)] active:border-[rgba(255,255,255,0.5)] active:bg-[rgba(255,255,255,0.25)] active:text-[rgba(19,47,156,0.7)] ${className}`}
    >
      {children}
    </button>
  )
}
