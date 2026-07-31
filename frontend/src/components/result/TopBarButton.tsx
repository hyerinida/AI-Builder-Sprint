import type { ReactNode } from 'react'

export function TopBarButton({
  children,
  className = '',
  onClick,
  active = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-[40px] border text-[16px] leading-[19px] font-medium transition-colors ${
        active
          ? 'border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.25)] text-[rgba(19,47,156,0.7)] shadow-[1px_1px_5px_rgba(47,55,63,0.15)]'
          : 'border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.2)] text-primary-700 shadow-[1px_2px_8px_rgba(47,55,63,0.2)] hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.3)] hover:shadow-[1px_2px_10px_rgba(47,55,63,0.25)] active:border-[rgba(255,255,255,0.5)] active:bg-[rgba(255,255,255,0.25)] active:text-[rgba(19,47,156,0.7)] active:shadow-[1px_1px_5px_rgba(47,55,63,0.15)]'
      } ${className}`}
    >
      {children}
    </button>
  )
}
