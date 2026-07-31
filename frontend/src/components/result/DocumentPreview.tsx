import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const BOX_WIDTH = 592

function PdfPage({ pdf, pageNumber }: { pdf: PDFDocumentProxy; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      const page = await pdf.getPage(pageNumber)
      const dpr = window.devicePixelRatio || 1
      const unscaledViewport = page.getViewport({ scale: 1 })
      const scale = (BOX_WIDTH * dpr) / unscaledViewport.width
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (cancelled || !canvas) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvas, viewport }).promise
    }

    render()
    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber])

  return <canvas ref={canvasRef} className="block w-full" />
}

export function DocumentPreview({ file }: { file?: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!previewUrl || file?.type !== 'application/pdf') {
      setPdf(null)
      return
    }
    let cancelled = false

    pdfjsLib
      .getDocument({
        url: previewUrl,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      })
      .promise.then((doc) => {
        if (!cancelled) setPdf(doc)
      })

    return () => {
      cancelled = true
    }
  }, [previewUrl, file])

  return (
    <div className="flex w-[592px] flex-col gap-[26px]">
      <p className="text-[28px] leading-[33px] font-semibold text-ink-700">분석 완료된 파일</p>
      <div
        className="h-[836px] w-full overflow-y-auto bg-[#D9D9D9] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {pdf &&
          Array.from({ length: pdf.numPages }, (_, index) => (
            <PdfPage key={index} pdf={pdf} pageNumber={index + 1} />
          ))}
        {previewUrl && file?.type.startsWith('image/') && (
          <img src={previewUrl} alt={file.name} className="block w-full" />
        )}
      </div>
    </div>
  )
}
