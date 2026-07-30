import type { ReactNode } from 'react'

export function ResultCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-[584px] min-w-[475px] rounded-xl border border-[#BEBEBE] bg-[#FAFCFF] ${className}`}>
      {children}
    </div>
  )
}
