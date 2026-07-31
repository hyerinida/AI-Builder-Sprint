export function AnalyzeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[59px] w-[146px] cursor-pointer items-center justify-center rounded-[36px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.2)] text-[24px] leading-[29px] font-semibold text-primary-700 shadow-[1px_2px_8px_rgba(47,55,63,0.2)] transition-colors hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.3)] active:border-[rgba(255,255,255,0.5)] active:bg-[rgba(255,255,255,0.25)] active:text-[rgba(19,47,156,0.7)]"
    >
      분석 시작
    </button>
  )
}
