# PRISM

> 문서를 일상 언어로 번역하는 AI

**AI Builder Sprint 2026** 참가 프로젝트. 
계약서, 채용공고, 정부지원사업 공고, 보험약관, 개인정보 동의서처럼 어렵고 불친절한 문서를 업로드하면, AI가 문서가 실제 선택에 미치는 영향을 분석하고, 사용자가 놓치기 쉬운 위험과 확인사항을 쉽게 설명하여 의사결정을 돕는 서비스.

## 문제 정의

사람은 중요한 결정을 할 때 사실보다 표현의 영향을 더 많이 받습니다.
계약서, 채용공고, 정부지원사업 공고, 보험약관처럼 중요한 문서는 대부분 법률·행정 용어로 작성되어 있습니다. 그래서 사람들은 문장을 읽어도 그 내용이 자신에게 어떤 결과를 가져오는지 이해하기 어렵습니다. 결국 중요한 판단 요소를 놓친 채 서명하거나 신청하고, 이후 분쟁이나 피해를 겪기도 합니다. 
문제를 해결하는 것은 AI의 분석력이고, 최종 결정을 내리는 것은 사람의 판단력입니다. PRISM은 문서를 사람이 이해할 수 있는 언어로 재해석하여 더 인간다운 의사결정을 돕습니다.

## 주요 기능

- **문서 업로드**: PDF, JPEG, PNG 지원 (드래그 앤 드롭 / 클릭 업로드)
- **OCR 및 구조화 분석**: Upstage Document Parse로 텍스트 추출 → Solar LLM으로 프레임 분석·현실 번역·행동 가이드 생성
- **프레임 분석**: 조항이 책임귀속·위험부담·결정권·행동요구·숨은조건·혜택제한 중 어떤 구조에 해당하는지 분석
  - 예) "원상복구 비용은 임차인이 부담한다." → *이 계약은 시설 훼손에 대한 책임을 임차인에게 집중시키는 구조입니다.*
- **현실 번역**: 조항이 실제로 어떤 상황을 만드는지 원문 → 쉬운 말 → 실제 발생 가능한 상황 3단계로 번역
  - 예) "계약 종료 후 30일 이내 보증금을 반환한다." → *계약 종료 후 바로 보증금을 받을 수 있는 것은 아닙니다. 최대 30일까지 기다려야 할 수 있습니다. 새로운 집 계약금을 준비해야 하는 상황이라면 자금 계획이 필요할 수 있습니다.*
- **행동 가이드**: 문서 종류에 맞춰 사용자가 문서 밖에서 확인하거나 실행해야 할 체크리스트 제시
- **문서 요약**: 분량 제한 없이 핵심 조항·조건·금액·기간을 빠짐없이 요약
- **문서 기반 Q&A**: 업로드한 문서 내용에 근거해서만 답변하는 챗봇

## 기술 스택

| 영역 | 스택 |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, pdfjs-dist |
| Backend | Spring Boot 3.5, Java 21, Gradle, Spring WebFlux, Spring Data JPA, H2 |
| AI | Upstage Solar LLM (`solar-pro2`, structured output), Upstage Document Parse (OCR) |
| API 문서 | springdoc-openapi (Swagger UI) |

## 아키텍처

```
[사용자] → 문서 업로드
   → Backend: Upstage Document Parse (OCR, markdown 추출)
   → Backend: Upstage Solar LLM (json_schema 구조화 출력)
        - 문서 요약 / 프레임 분석 / 현실 번역 / 행동 가이드 동시 생성
   → Frontend: 결과 카드 렌더링 + 문서 기반 챗봇
```

## 실행 방법

### 1. 환경변수 설정

```bash
cd backend/prism
cp .env.example .env
# .env 파일에 UPSTAGE_API_KEY 입력
```

### 2. Backend 실행 (Spring Boot + Java 21 + Gradle)

```bash
cd backend/prism
./gradlew bootRun     # 로컬 서버 실행 (기본 포트 8080)
./gradlew build       # 빌드 + 테스트
./gradlew test        # 테스트만 실행
```

`bootRun`/`test`는 프론트엔드 번들링과 분리되어 있어 **Node.js 없이도 백엔드만 바로 실행**할 수 있습니다. 로컬 개발 시에는 아래 3번처럼 프론트엔드 개발 서버를 별도로 띄워 사용하세요.

### 3. Frontend 단독 개발 서버 (선택)

```bash
cd frontend
npm install
npm run dev       # 로컬 개발 서버 (기본 포트 5173, /api는 8080으로 프록시)
npm run build     # 타입체크 + 프로덕션 빌드
npm run lint      # oxlint
```

### 4. 배포용 단일 패키징 (선택)

프론트엔드와 백엔드를 하나의 실행 가능한 jar로 묶으려면 아래 명령을 사용합니다. 이 경우에만 로컬에 Node.js/npm이 필요합니다.

```bash
cd backend/prism
./gradlew bootJar     # frontend/를 npm install && npm run build한 뒤
                       # 결과물을 BOOT-INF/classes/static에 포함해 실행 가능한 jar 생성
java -jar build/libs/prism-0.0.1-SNAPSHOT.jar
```

### 5. API 문서

서버 실행 후 `http://localhost:8080/swagger-ui.html` 에서 확인할 수 있습니다.

## AI 활용 내역

PRISM은 두 층위에서 AI를 활용합니다: **(1) 서비스 자체의 핵심 기능을 구현하는 AI**와 **(2) 개발 과정을 가속한 AI**입니다.

### 1. 서비스 핵심 기능: Upstage API

- **Document Parse**: 업로드된 PDF·이미지에서 텍스트를 추출해 markdown으로 변환 (OCR)
- **Solar LLM (`solar-pro2`)**: 추출된 문서 내용을 바탕으로 프레임 분석(6개 카테고리 구조 판정), 현실 번역(원문→쉬운 말→실제 발생 가능한 상황), 행동 가이드, 문서 요약을 `response_format: json_schema` 구조화 출력으로 동시 생성
- **문서 기반 Q&A**: 업로드된 문서의 markdown을 컨텍스트로 Solar LLM에 전달해, 문서에 명시된 내용에 근거해서만 답변하도록 프롬프트로 제약
- 프롬프트/스키마 설계 과정(프레임 정의·판단 기준·경계 규칙 명시, few-shot 예시 구성 등)은 [`AI_USAGE (backend).md`](./AI_USAGE%20%28backend%29.md)에 상세히 기록되어 있습니다.

### 2. 개발 과정: Claude Code / Claude

개발 전 과정(설계 → 구현 → 디버깅 → 배포 준비)에서 Claude Code와 Claude를 적극 활용했습니다.

- **설계/의사결정**: 프레임 분석과 현실 번역을 독립적인 스키마로 분리하는 등, 기획서를 실제 API 응답 구조(JSON Schema)로 구체화하는 과정에서 Claude와 함께 여러 차례 설계를 재검토하고 확정
- **구현**: Figma 스펙 기반 결과 화면 컴포넌트, Upstage WebClient 연동, 문서 업로드→OCR→분석→저장 파이프라인 등 프론트·백엔드 전반의 코드 작성
- **디버깅**: React StrictMode 이중 실행으로 인한 API 중복 호출, 컨트롤러의 동기 예외가 리액티브 체인의 `onErrorResume`에 잡히지 않던 문제 등을 실제 로그·재현을 통해 근본 원인까지 함께 추적
- **검증**: 헤드리스 Chrome(CDP) 스크립트로 업로드→분석→렌더링 E2E 검증, 매 변경마다 `npm run build`/`npm run lint` 실행으로 회귀 방지
- **문서화/워크플로**: 커밋을 기능 단위로 쪼개고 conventional commit 형식 유지, PR 본문 작성 보조

작업별 상세 프롬프트·의사결정 기록은 아래 문서에 정리되어 있습니다.

- 프론트엔드는 개발 전 과정에서 Claude Code를 활용했으며 히스토리는 [`AI_USAGE (frontend).md`](./AI_USAGE%20%28frontend%29.md), 관련 지침은 [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md)에 기록되어 있습니다.
- 백엔드는 개발 전 과정에서 Claude를 활용하여 Upstage API(Document Parse, Solar LLM) 연동 설계, 프롬프트/스키마 설계 과정과 의사결정을 하였으며, 히스토리는 [`AI_USAGE (backend).md`](./AI_USAGE%20%28backend%29.md)에 상세히 정리되어 있습니다.

## 개인정보 및 보안

- 업로드된 **원본 파일**은 서버 디스크에 저장되지 않고 Upstage API로 직접 전달되어 처리됩니다.
- OCR로 추출된 문서 내용과 분석 결과는 **재조회 기능(결과 다시보기, 문서 기반 챗봇)을 위해 DB에 보관**됩니다. 완전한 자동 삭제가 필요한 경우 별도 삭제 정책 도입이 필요합니다.
- `UPSTAGE_API_KEY` 등 민감 정보는 `.env` 파일로 관리하며 `.gitignore`에 포함되어 저장소에 커밋되지 않습니다.
- 업로드 가능한 파일은 PDF·JPEG·PNG, 최대 15MB로 서버에서 제한하며, 이 범위를 벗어나거나 존재하지 않는 문서를 조회하는 경우 등도 일관된 JSON 오류 응답으로 처리됩니다.

## 프로젝트 구조

```
.
├── AGENTS.md                          # 공통 에이전트 지침 (빌드/테스트/스타일 규칙)
├── CLAUDE.md                          # Claude Code 전용 지침
├── AI_USAGE (backend).md              # Upstage API 활용 및 프롬프트 설계 상세 기록
├── AI_USAGE (frontend).md             # 결과 화면 컴포넌트 구현·백엔드 연동·버그 진단·E2E 검증 과정에서의 Claude Code 활용 기록
├── backend/prism/                     # Spring Boot 백엔드
│   └── src/main/java/com/dontgiveup/prism/
│       ├── document/                  # 문서 업로드/분석/조회/챗봇 도메인 + 업로드 검증
│       ├── upstage/                   # Upstage API 연동 서비스
│       ├── config/                    # WebClient, OpenAPI 설정
│       └── common/                    # 전역 예외 처리
└── frontend/                          # React + Vite 프론트엔드
    └── src/
        ├── pages/                     # UploadPage, AnalyzingPage, ResultPage
        ├── components/                # 업로드/결과/레이아웃/공통 컴포넌트
        └── api/                       # 백엔드 API 클라이언트
```
