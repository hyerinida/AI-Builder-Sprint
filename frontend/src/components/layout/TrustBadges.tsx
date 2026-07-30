import lockIcon from '../../assets/icon_자물쇠.svg'
import boltIcon from '../../assets/icon_번개.svg'

export function TrustBadges() {
  return (
    <div className="absolute right-[33px] bottom-[29px] flex items-start gap-[17px] text-ink-900">
      <div className="flex items-end gap-[6px]">
        <img src={lockIcon} alt="" />
        <span className="text-[16px] leading-[19px] font-medium">문서 보안</span>
      </div>
      <div className="flex items-center gap-[6px]">
        <img src={boltIcon} alt="" />
        <span className="text-[16px] leading-[19px] font-medium">빠른 분석</span>
      </div>
    </div>
  )
}
