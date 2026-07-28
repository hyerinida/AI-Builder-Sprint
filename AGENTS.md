# AGENTS.md

## 프로젝트 개요

**AI Builder Sprint 2026** 해커톤 참가 프로젝트. "AI를 통해 인간다움을 더욱 잘 드러낼 수 있는 서비스"를 168시간 안에 구현한다.

- 저장소 구조: `frontend/` (웹 클라이언트), `backend/` (API 서버, 구성 예정)
- 개발 기간이 짧으므로 과설계보다 동작하는 결과물 우선. 새로운 추상화·라이브러리는 실제로 필요할 때만 추가한다.

## 빌드 / 테스트 명령

### frontend (Vite + React + TypeScript + Tailwind)

```bash
cd frontend
npm install
npm run dev       # 로컬 개발 서버
npm run build     # 타입체크 + 프로덕션 빌드
npm run lint      # oxlint
```

### backend (Spring Boot + Java 21 + Gradle)

```bash
cd backend/prism
./gradlew bootRun     # 로컬 서버 실행
./gradlew build       # 빌드 + 테스트
./gradlew test        # 테스트만 실행
```

- 기본 설정 파일: `backend/prism/src/main/resources/application.yaml`
- 패키지 루트: `com.dontgiveup.prism`

## 스타일 규칙

- frontend: TypeScript 사용, 스타일링은 Tailwind 클래스 우선 (별도 CSS 파일 최소화)
- 상태관리 라이브러리(Redux, Zustand 등)는 실제로 복잡한 전역 상태가 생기기 전까지 도입하지 않는다 (React state/Context로 충분)
- backend: Lombok으로 보일러플레이트 최소화, 컨트롤러/서비스/리포지토리 계층 분리 유지
- 커밋 메시지는 `feat:`, `fix:`, `chore:` 등 conventional commit 형식 사용

## 브랜치 / PR 규칙

- `main`은 항상 데모 가능한 상태 유지
- 기능 단위로 `frontend/xxx`, `backend/xxx` 형태 브랜치 생성 후 작업
- `main`에 병합하기 전 로컬에서 빌드/실행 확인 필수

## 보안

- API 키, 시크릿은 `.env` 파일에 저장하고 절대 커밋하지 않는다 (`.gitignore`에 포함되어 있는지 확인)
- Upstage API 등 외부 API 키는 팀 내부 채널로만 공유

## 대회 관련 참고

- 코딩 에이전트(Claude Code 등) 사용 시 `.claude/`, `AGENTS.md` 등 관련 설정 파일을 저장소에 반드시 포함해야 심사에 반영됨 (README.md 참고)
