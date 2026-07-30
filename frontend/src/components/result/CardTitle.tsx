import titleIcon from '../../assets/icon_분석항목제목.svg'

export function CardTitle({ children, bold = false }: { children: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img src={titleIcon} alt="" className="h-7 w-7" />
      <span className={`text-[20px] leading-[24px] text-ink-700 ${bold ? 'font-bold' : 'font-semibold'}`}>
        {children}
      </span>
    </div>
  )
}
