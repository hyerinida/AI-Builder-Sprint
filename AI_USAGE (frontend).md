# 프론트엔드 AI 활용 증빙

PRISM 프론트엔드를 개발하면서 [Claude Code](https://claude.com/claude-code)(Sonnet 계열 모델)의 도움을 받아 컴포넌트 구현, 리팩터링, 백엔드 연동, 디버깅 속도를 높였습니다. 아래는 실제 개발 과정에서 Claude Code의 도움을 받은 작업 내역입니다.

## 1. 결과 페이지 컴포넌트 구현

- `ResultPage`를 중심으로 `FrameAnalysisCard`, `RealityTranslationCard`, `ActionGuideCard`, `DocumentPreview`, `TopBarButton` 등 결과 화면 컴포넌트를 Figma에서 뽑은 CSS 스펙을 기준으로 구현할 때 Claude Code의 도움을 받음
- 문서 요약 확인 모달(`SummaryConfirmModal`), 로딩 오버레이(`SummaryLoadingOverlay`), AI 질문 챗 오버레이(`ChatOverlay`) UI를 작성하고 `ResultPage`의 뷰 전환(분석 결과 ↔ 문서 요약) 상태와 연결하는 과정에서 도움을 받음
- 디자인 스펙(색상/폰트 굵기/여백/그라데이션 등)과 실제 구현 코드를 대조 검증해 불일치 항목을 찾아내는 데 활용

## 2. 백엔드 API 연동 (목업 제거)

- `api/documents.ts`를 실제 백엔드 스키마(`POST /api/documents`, `GET /api/documents/{id}`, `POST /api/documents/{id}/chat`)에 맞춰 재작성할 때 도움을 받음
- 백엔드가 분석 실패 시에도 HTTP 200과 함께 `status: FAILED`를 반환하는 케이스를 실제 백엔드 소스 코드(`DocumentService.java`)까지 같이 확인해 파악하고, 프론트에서 이를 명시적으로 에러 처리하도록 수정
- 업로드 → 분석중 → 결과 페이지로 이어지는 전체 플로우를 `App.tsx`의 상태 머신으로 구현하고, URL 쿼리 기반 결과 복원(`?document={id}`) 기능을 추가하는 과정에서 도움을 받음

## 3. 버그 진단 및 수정

- React StrictMode의 effect 이중 실행으로 문서 분석 API가 매 업로드마다 중복 발사되던 버그를, 실제 백엔드 로그(H2 DB 조회, Upstage rate limit 응답)를 함께 재현·분석해 근본 원인을 찾고 수정 (분석 요청을 이벤트 핸들러 시점에 1회만 생성하도록 아키텍처 변경)
- 로컬 개발 환경에서 포트 충돌(Docker Desktop의 유령 포트 점유), `gradlew` 실행 권한 유실 등 환경 이슈를 진단하는 데 활용
- 오래 켜둔 백엔드 프로세스의 Upstage 커넥션 풀 stale 이슈를 로그 분석으로 함께 원인 파악

## 4. 검증 방식

- 헤드리스 Chrome(CDP)을 직접 구동하는 스크립트를 작성해 실제 파일 업로드 → 분석 → 결과 렌더링까지 E2E로 검증하는 데 활용
- `npm run build`, `npm run lint`을 매 변경마다 실행해 타입/린트 회귀를 방지

## 5. 배포 준비 및 Git 워크플로우

- 배포 시 프론트/백엔드를 단일 아티팩트로 묶는 Gradle 빌드 구성(`bootJar`가 프론트 빌드 결과물을 포함하도록) 설계에 도움을 받음
- 커밋을 기능 단위로 나누고 conventional commit 메시지를 작성, Pull Request 본문 작성을 보조받음
