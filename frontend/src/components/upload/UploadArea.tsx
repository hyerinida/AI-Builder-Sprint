import { useRef, useState } from 'react'
import uploadFileIcon from '../../assets/icon_upload_file.svg'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

export function UploadArea({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hasUnsupportedFile, setHasUnsupportedFile] = useState(false)

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (ACCEPTED_TYPES.includes(file.type)) {
      setHasUnsupportedFile(false)
      onFileSelected(file)
    } else {
      setHasUnsupportedFile(true)
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`flex h-[400px] w-[824px] cursor-pointer flex-col items-center justify-center gap-[17px] rounded-[24px] border border-[#BEBEBE] transition-colors active:bg-[#EBEEF0] ${
        isDragging ? 'bg-[#CCD1D5]' : 'bg-[#EDEFF2] hover:bg-[#CCD1D5]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <img src={uploadFileIcon} alt="" className="h-[105px] w-[91px]" />
      <p className="text-[28px] leading-[33px] font-extrabold text-ink-700/50">
        문서를 드래그하거나 클릭하여 업로드
      </p>
      {hasUnsupportedFile ? (
        <p className="text-[16px] leading-[19px] font-semibold text-red-500">
          지원하지 않는 파일 형식입니다. (PDF, JPEG, JPG, PNG만 가능)
        </p>
      ) : (
        <p className="text-[16px] leading-[19px] font-semibold text-[#717171]">
          지원 파일 형식: PDF, JPEG, JPG, PNG
        </p>
      )}
    </div>
  )
}
