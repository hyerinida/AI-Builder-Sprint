import completeIcon from '../../assets/icon_완료.svg'
import incompleteIcon from '../../assets/icon_미완료.svg'

export function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex h-8 items-center gap-5">
      <img src={done ? completeIcon : incompleteIcon} alt="" className="h-8 w-8" />
      <span className="text-[18px] leading-[21px] font-medium text-black">{label}</span>
    </div>
  )
}
