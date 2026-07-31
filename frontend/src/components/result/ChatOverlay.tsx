import { useState } from 'react'

export type ChatMessage = { role: 'user' | 'ai'; text: string }

const PROMPT_SUGGESTIONS = ['위약금 조항을 설명해주세요.', '보증금 반환 조건이 궁금해요.']

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2F373F" strokeWidth="1" strokeLinecap="round">
      <path d="M1 1l10 10M11 1L1 11" />
    </svg>
  )
}

function SendIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15V1M1 6l5-5 5 5" />
    </svg>
  )
}

export function ChatOverlay({
  messages,
  onSend,
  onClose,
}: {
  messages: ChatMessage[]
  onSend: (text: string) => void
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const isWaiting = messages.length > 0 && messages[messages.length - 1].role === 'user'

  function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isWaiting) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="pointer-events-none absolute top-[692px] left-1/2 h-14 w-[798px] -translate-x-1/2 bg-[#D9D9D9]/40 blur-[45px]" />
      <div
        className="absolute inset-x-0 top-[107px] bottom-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(36,43,49,0) 0px, rgba(36,43,49,0.14) 35px, rgba(36,43,49,0.45) 70px, rgba(36,43,49,0.76) 105px, rgba(36,43,49,0.9) 140px, rgba(36,43,49,0.9) 100%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[107px] h-[193px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
      {messages.length === 0 ? (
        <div className="absolute top-[441px] left-1/2 flex w-[824px] -translate-x-1/2 flex-col items-center gap-11">
          <div className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
            <p
              className="inline-block bg-clip-text text-center text-[36px] leading-[43px] font-bold text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #BDABDF 0%, #D6F4F2 20%, #B1AFDD 60%, #BDABDF 80%)',
              }}
            >
              계약서 내용에 대해 자유롭게 질문해주세요
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-[16px] leading-7 font-medium text-[rgba(250,252,255,0.75)]">
            {PROMPT_SUGGESTIONS.map((prompt) => (
              <p key={prompt}>• {prompt}</p>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="absolute top-[133px] left-1/2 flex h-[500px] w-[780px] -translate-x-1/2 flex-col overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="mt-auto flex flex-col gap-9">
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <div
                  key={index}
                  className="ml-auto max-w-[684px] rounded-tl-[32px] rounded-tr-none rounded-br-[32px] rounded-bl-[32px] bg-[#FAFCFF] px-5 py-5 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-[16px] leading-[19px] font-medium text-black">{message.text}</p>
                </div>
              ) : (
                <p
                  key={index}
                  className="w-[665px] text-[18px] leading-7 font-medium text-white"
                  style={{ textShadow: '0px 4px 4px rgba(0,0,0,0.6)' }}
                >
                  {message.text}
                </p>
              ),
            )}
          </div>
        </div>
      )}

      <div className="absolute top-[692px] left-1/2 -translate-x-1/2">
        <div className="relative flex h-14 w-[798px] items-center justify-between rounded-[36px] bg-[#F2F2F2] py-2 pr-[7px] pl-[23px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            placeholder="무엇이 궁금하신가요?"
            className="flex-1 bg-transparent text-[16px] leading-[19px] font-medium text-ink-700 outline-none placeholder:text-[rgba(36,43,49,0.5)]"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isWaiting}
            aria-label="질문 보내기"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9]"
          >
            <SendIcon color="#2F373F" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="검색창 닫기"
            className="absolute top-[-40px] left-[798px] flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F2F2F2] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#D9D9D9] active:bg-[#D9D9D9]"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
