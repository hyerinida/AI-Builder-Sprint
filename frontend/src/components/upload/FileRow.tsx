import pdfIcon from '../../assets/icon_PDF.svg'
import imageIcon from '../../assets/icon_Image.svg'

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/')

  return (
    <div className="-ml-px flex h-[124px] w-[824px] items-center justify-between border border-[#B9B9B9] bg-[#F2F3F4] pr-6 pl-7">
      <div className="flex min-w-0 items-center gap-7 pl-[6px]">
        <img src={isImage ? imageIcon : pdfIcon} alt="" className="shrink-0" />
        <div className="flex min-w-0 flex-col gap-[7px]">
          <p className="max-w-[636px] truncate text-[20px] leading-[24px] font-medium text-ink-700">
            {file.name}
          </p>
          <p className="text-[18px] leading-[21px] font-medium text-[#848484]">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="파일 삭제"
        className="h-8 w-8 shrink-0 cursor-pointer text-ink-700"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
