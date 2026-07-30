import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { UploadArea } from '../components/upload/UploadArea'
import { FileRow } from '../components/upload/FileRow'
import { AnalyzeButton } from '../components/common/AnalyzeButton'

const HEADING_GRADIENT = {
  backgroundImage:
    'linear-gradient(90.2deg, #5DB4F7 -4.5%, #9173CA 26.91%, #132F9C 64.73%, #D6F4F2 105.87%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const

export function UploadPage({ onAnalyze }: { onAnalyze: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null)

  return (
    <AppLayout onLogoClick={() => setFile(null)}>
      <div className="flex flex-col items-center gap-[44px]">
        <p style={HEADING_GRADIENT} className="text-[40px] leading-[48px] font-bold">
          복잡한 계약서와 문서를 쉽게 이해할 수 있어요.
        </p>
        <div className="flex flex-col items-center gap-[24px]">
          {file === null ? (
            <UploadArea onFileSelected={setFile} />
          ) : (
            <div className="relative h-[400px] w-[824px] overflow-hidden rounded-[24px] border border-[#BEBEBE] bg-[#EDEFF2]">
              <div className="flex flex-col gap-[27px] pt-7">
                <p className="pl-9 text-[24px] leading-[29px] font-semibold text-ink-700">업로드된 문서</p>
                <FileRow file={file} onRemove={() => setFile(null)} />
              </div>
              <div className="absolute right-[58px] bottom-[61px]">
                <AnalyzeButton onClick={() => file && onAnalyze(file)} />
              </div>
            </div>
          )}
          <p className="text-[16px] leading-[19px] font-medium text-muted">
            업로드된 문서는 분석 완료 후 서버에 저장되지 않고 즉시 영구 삭제됩니다.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
