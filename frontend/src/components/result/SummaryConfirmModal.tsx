import alertIcon from '../../assets/icon_alert.svg'

export function SummaryConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(47,55,63,0.3)]">
      <div className="flex w-[432px] flex-col items-center gap-10 rounded-[32px] bg-[#FAFCFF] px-[84px] py-8 shadow-[8px_8px_8px_rgba(36,43,49,0.25),inset_1px_1px_4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col items-center gap-9">
          <div className="flex items-center gap-[11px]">
            <img src={alertIcon} alt="" className="h-[19px] w-[22px]" />
            <p className="text-[20px] leading-[24px] font-bold text-ink-700">AI가 문서를 요약합니다.</p>
          </div>
          <p className="text-center text-[16px] leading-[19px] font-medium text-ink-700">
            최종 판단과 결정은 <span className="font-bold">사용자의 몫</span>입니다.
          </p>
        </div>
        <div className="flex items-center gap-16">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-[84px] cursor-pointer items-center justify-center rounded-[36px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.2)] text-[16px] font-semibold text-[#535353] shadow-[1px_2px_8px_rgba(47,55,63,0.2)]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 w-[84px] cursor-pointer items-center justify-center rounded-[36px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.2)] text-[16px] font-semibold text-primary-700 shadow-[1px_2px_8px_rgba(47,55,63,0.2)]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
