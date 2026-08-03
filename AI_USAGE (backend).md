# 📄 PRISM AI 활용 증빙 자료 (Backend)

## 1. 개발 과정 Claude AI 활용 내역
### Upstage API 연결 및 테스트 관련 활용 내역
- **Upstage API 연동 로직 작성 지원**
  - 내용: Spring Boot에서 WebClient를 이용해 Upstage Document Parse(`/v1/document-digitization`) 및 Solar Chat(`/v1/chat/completions`) API를 호출하는 `UpstageService` 구현. `MultipartFile`을 `MultipartBodyBuilder`로 변환해 Document Parse API에 전달하는 로직 포함

- **Upstage 인증 및 설정 구조 설계 지원**
  - 내용: API 키를 코드에 하드코딩하지 않고 `.env`/환경변수(`UPSTAGE_API_KEY`)로 주입받도록 `UpstageProperties`(`@ConfigurationProperties`), `UpstageWebClientConfig`(Bearer 인증 헤더 자동 첨부 WebClient Bean) 설계

- **연결 테스트용 API 엔드포인트 구현**
  - 내용: `/api/upstage/chat-test`(GET), `/api/upstage/parse-test`(POST, multipart) 테스트 컨트롤러 작성. 실제 기능 완성 전 "API 키 유효성 및 연동 여부"만 빠르게 검증할 수 있도록 구성

- **환경변수 미주입 이슈 디버깅 지원**
  - 내용: `@ConfigurationPropertiesScan` 누락으로 인한 `UpstageProperties` Bean 미등록 오류, IntelliJ Run Configuration 환경변수 미반영으로 인한 401 Unauthorized 오류를 단계별로 원인 분리(Postman 단독 호출 → 백엔드 경유 호출 비교) 및 해결

### 핵심 로직 설계 및 디버깅 관련 활용 내역
- **문서 업로드 → Parse → 저장 파이프라인 설계 지원**
  - 내용: `Document`(JPA Entity), `DocumentRepository`, `DocumentResponse`(DTO), `DocumentService`, `DocumentController`를 컨트롤러/서비스/리포지토리 계층으로 분리 설계. Parse 결과(markdown)를 H2 DB에 영속화하고 `GET /api/documents/{id}`로 재조회 가능하도록 구현

- **Frame Analysis / Reality Translation 개념 구분 및 스키마 재설계**
  - 내용: 기획서 2번(PRISM Frame Analysis)과 3번(Reality Translation) 항목을 재검토하여, 두 기능이 "같은 조항을 다르게 해석하는 하나의 파이프라인"이 아니라 **서로 독립적인 선별·해석 기준을 갖는 별개 시스템**임을 확인시킴. 초안에서는 `category`(프레임 분석 산출물)와 `easyWords`/`realWorldImpact`(현실 번역 산출물)가 하나의 아이템에 혼재되어 있었으나, `frameAnalyses[]`(구조적 프레임 판정: 책임/위험/결정권/행동요구/숨은조건/혜택제한 6개 카테고리)와 `realityTranslations[]`(원문→쉬운 말→실제 발생 가능한 상황 3단 번역)로 완전히 분리. 동일 조항이 양쪽 배열에 모두 선택되거나 한쪽에만 선택될 수 있도록 설계

- **화면 설계(Figma 목업) 기반 응답 구조 정합화**
  - 내용: 결과 화면 목업(Screen 3)의 "프레임 분석(총평 1줄 + 더보기)", "현실 번역(원문→쉬운말→실제상황 카드)" UI 구조를 분석하여, `frameSummary`(문서 전체 총평, 헤드라인용)와 `frameAnalyses[]`(총평의 근거가 되는 조항별 상세, 더보기용)를 함께 두는 구조로 스키마 확정. 두 필드가 상충하는 게 아니라 같은 배열 데이터를 서로 다른 레이어(헤드라인 vs 근거)로 노출하는 것이라는 점을 정리

- **JSON Schema 응답 필드 순서 이슈 디버깅**
  - 내용: `Map.of()`로 구성한 JSON Schema의 `properties`가 순서를 보장하지 않아 실제 LLM 응답에서 `originalText`가 각 항목의 마지막에 위치하는 현상 확인. `LinkedHashMap`으로 전환하여 스키마 정의 순서(`originalText`를 각 아이템 최상단)를 명시적으로 고정, 응답 필드 순서 개선

- **Action Guide 기능 설계 및 스키마 단순화 결정**
  - 내용: 초안 기획서에 Decision Check(문서 밖 확인사항)과 Action Guide(실행할 행동)을 별도 기능으로 각각 구현할지, 하나로 통합할지 검토. 초안에서는 두 개념을 살려 `actionGuides[]` 각 항목에 `type`(`DECISION_CHECK` / `ACTION`) 필드를 두어 "계약·지원 결정 전 확인해야 할 사항"과 "결정 후 실행해야 할 행동"을 구분하는 구조로 설계. 이후 실제 산출 예시(등기부등본 확인 vs 입주 전 사진 촬영 등)를 검토한 결과, 시점(결정 전/후) 구분의 의미 자체는 유효하지만 현재 스코프에서는 UI·프롬프트 복잡도 대비 구분 실익이 낮다고 판단하여 `type` 필드를 제거. 최종적으로 `actionGuides[]`를 `item`(체크리스트 항목명) + `description`(필요 이유) 두 필드만 갖는 단일 체크리스트 구조로 확정하고, `frameAnalyses`/`realityTranslations`와 동일한 JSON Schema 파이프라인(`response_format: json_schema`) 안에 세 번째 분석 항목으로 통합

- **documentSummary 분량 제한 해제**
  - 내용: 초기 `documentSummary`는 한두 문장 수준의 짧은 요약으로 설계되어 있었으나, 사용자가 원문을 읽지  않고도 전체 계약 내용을 파악할 수 있으려면 문장 수 제약이 오히려 정보 누락을 유발한다고 판단
  `document/DocumentAnalysisSchema.java`의 `documentSummary` 필드 `description`을 "짧은 요약"에서 "분량 제한 없이 주요 조항·조건·금액·기간 등 핵심 정보를 빠짐없이 포함하는 상세 요약"으로 재작성
  `upstage/UpstageService.java`의 `analyzeDocument()` 프롬프트 최상단에 `[요약 규칙 (documentSummary)]` 섹션을 별도로 추가하여, 구조화 출력 스키마의 `description`만으로는 모델이 문장 수를 임의로 줄이는 경향을 보완하고 "문장 수를 임의로 줄이지 말 것"을 프롬프트 레벨에서 재차 강조
  이를 통해 스키마 설명(`description`)과 프롬프트 지시를 이중으로 정합화하여 요약 분량이 실제로 짧게 절삭되지 않도록 유도

- **문서 기반 Q&A(챗봇) 기능 구현**
  - 내용: 이미 업로드·분석 완료된 문서(`parsedMarkdown`)를 컨텍스트로 삼아, 사용자가 문서 내용 중 궁금한   점을 자유 질문 형태로 물어보면 답변하는 기능 설계. 대회 일정상 대화 히스토리 저장(멀티턴 컨텍스트 유지)은 우선순위에서 제외하고, 매 질문마다 해당 문서의 전체 `parsedMarkdown`을 프롬프트에 포함해 단발성으로 답변을 생성하는 stateless 방식으로 우선 구현. 추후 문서가 길어질 경우 청크 검색(RAG) 방식으로 확장 가능하도록 `UpstageService`에 별도 메서드(`chatAboutDocument`)로 분리
  답변이 문서 내용을 벗어나 임의로 지어내는 것을 막기 위해 "반드시 제공된 문서 내용에 근거해서만 답변, 문서에 없는 내용은 추측하지 말 것"을 프롬프트 규칙으로 명시. 법률/전문 용어가 포함된 문서 특성상 "일반인이 이해하기 쉬운 말로 풀어서 설명"하도록 지시 추가

- **Frame Analysis 프롬프트 고도화 및 출력 필드 세분화**
  - 내용: 초기 버전의 프레임 분석 프롬프트는 6개 프레임에 대해 명칭과 판단 기준을 간략히만 제시하고, 결과 스키마도 `originalText`/`category`/`interpretation` 3개 필드로 구성되어 있어 "왜 이 프레임으로 분류했는지"에 대한 판정 근거가 결과에 명시적으로 남지 않는 한계가 있었음. 이를 보완하기 위해 각 프레임별 정의(Definition)·판단 기준(Decision Rules)·언어적 특징(Linguistic Indicators)·인접 프레임과의 경계 규칙(Boundary Rules)을 상세히 명시한 프롬프트로 교체하고, 분석 절차(문장 읽기 → 정의·기준 비교 → Frame 선택 → evidence 추출 → description 작성)를 단계별로 지시하도록 구조화
  - 스키마 변경: 판정 근거를 결과에 별도로 남기기 위해 원문에서 그대로 추출한 핵심 근거 문구를 담는 `evidence` 필드를 신규 추가하고, 역할이 모호했던 기존 `interpretation` 필드명은 더 명확한 `description`으로 변경. `originalText`(하이라이트 위치 탐색용 전체 문장/구절)와 `evidence`(그 안에서 판정 근거가 되는 핵심 표현만 짧게 발췌)의 역할을 분리해, 프론트엔드 하이라이트 매칭 기능과 판정 근거 노출을 동시에 지원하도록 `document/DocumentAnalysisSchema.java`의 `frameAnalysisProps`를 `originalText`/`category`/`description`/`evidence` 4개 필드로 재설계
  - Few-shot 예시 축약: 원 프롬프트 초안은 카테고리당 5개(총 30개)의 예시를 포함하고 있었으나, 실제 API 호출 시 프롬프트 토큰 비용과 응답 지연을 고려해 카테고리당 1개(총 6개)로 축약해 병합. 각 프레임의 정의·판단기준·언어적 특징·경계 규칙 설명은 축약 없이 전체 반영

### API 안정성 및 배포 환경 개선 관련 활용 내역 (제출 전 코드 리뷰 기반)
- **API 예외 처리 일원화 (`GlobalExceptionHandler`)**
  - 내용: `DocumentController.getDocument()`/`chat()`이 `DocumentService`의 `Optional.orElseThrow(NoSuchElementException)`을 리액티브 체인이 시작되기 전에 **동기적으로** 던지는 구조라, 컨트롤러 안의 `onErrorResume`으로는 잡히지 않고 스프링 기본 HTML 에러 페이지(Whitelabel Error Page)로 응답되던 문제를 Claude와 함께 코드 리뷰하며 발견. `@RestControllerAdvice` 기반 `common/GlobalExceptionHandler`를 신설하여 `NoSuchElementException`(404), `IllegalStateException`/`IllegalArgumentException`(400), `MaxUploadSizeExceededException`(413), 그 외 예외(500)를 `{status, message, timestamp}` 형태의 일관된 JSON으로 응답하도록 통일
  - 검증: Postman으로 존재하지 않는 `documentId` 조회(`GET /api/documents/999999`) 및 존재하지 않는 문서에 챗봇 질문(`POST /api/documents/999999/chat`) 시나리오를 직접 재현하여, 수정 전(HTML 에러 페이지) → 수정 후(JSON 에러 응답) 응답 형식 변화를 확인

- **업로드 파일 서버 사이드 검증 추가 (`DocumentUploadValidator`)**
  - 내용: 프론트엔드 `UploadArea`의 `accept` 속성/`file.type` 필터링은 UX 편의 기능일 뿐 실제 요청을 막지는 못한다는 점(Postman 등으로 API를 직접 호출하면 프론트 검증이 그대로 우회됨)을 인지하고, 백엔드에도 동일 기준의 검증을 추가하기로 결정. `document/DocumentUploadValidator`를 신설해 빈 파일, 15MB 초과, PDF/JPEG/PNG 외 포맷 업로드를 `DocumentService.analyze()` 진입 시점에 차단하도록 구현(불필요한 Upstage API 호출/크레딧 낭비 방지 목적 겸함)
  - `application.yaml`에 `spring.servlet.multipart.max-file-size`/`max-request-size: 15MB`를 추가해 애플리케이션 레벨에서도 동일 상한을 이중으로 강제
  - 지원 포맷을 4개로 제한한 근거 정리: (1) `DocumentPreview.tsx`가 PDF/이미지 렌더링만 지원해 UI가 그릴 수 있는 포맷과 의도적으로 일치시킴 (2) PRISM이 다루는 계약서·공고문·약관류는 실제로 대부분 PDF/스캔 이미지 형태로 유통되어 실사용 시나리오에 부합 (3) 168시간의 개발 기간 내 안정적으로 QA 가능한 범위로 스코프를 의도적으로 제한 (4) 업로드 허용 확장자 화이트리스트 최소화를 통한 공격 표면 축소

- **프론트엔드 번들링과 로컬 백엔드 개발 분리 (`build.gradle`)**
  - 내용: 기존 `build.gradle`은 `processResources`가 `copyFrontend → npmBuild → npmInstall`에 의존하는 구조라, node/npm이 없는 로컬 환경에서 `./gradlew bootRun`(IntelliJ 실행 포함) 시 `npmInstall` 단계에서 빌드가 실패하는 문제를 발견. `AGENTS.md`에 명시된 "프론트/백엔드 개별 개발(`npm run dev` + `gradlew bootRun`, `vite.config.ts` 프록시 경유)" 워크플로에 맞춰, 프론트엔드 빌드를 `processResources`가 아닌 배포용 패키징 태스크(`jar`/`bootJar`)에만 연결하도록 1차 재구성
  - 이후 `bootJar`로 패키징한 산출물이 실제 배포 환경에서 프론트 정적 파일을 찾지 못해 배포가 되지 않는 문제가 재발하여, `jar`/`bootJar` 태스크에 `from(...) { into ... }` DSL을 직접 사용해 프론트 `dist` 산출물을 각 태스크의 목적지(`jar`는 `static`, `bootJar`는 `BOOT-INF/classes/static`)에 정확히 포함하는 방식으로 2차 수정
  - 결과적으로 `bootRun`/`test`는 Node 없이도 동작하고, 실제 배포용 패키징(`bootJar`)에서만 프론트 빌드가 트리거되도록 로컬 개발 환경과 배포 환경의 요구사항을 분리

## 2. Upstage API 활용 현황
- **Document Parse API**: 문서 업로드 시 텍스트 추출
- **Solar LLM**: 추출된 텍스트를 기반으로 프레임 분석, 현실 번역, 문서 요약 및 Q&A 생성

### 2-1. API 호출 테스트 및 응답 증빙
- **api/documents (문서 OCR 및 Frame Analysis & Reality Translation & actionGuides) 테스트**
  - Response 결과 JSON 데이터 샘플
  ```json
  {
    "documentId": 1,
    "fileName": "PRISM_예시_전세계약서.pdf",
    "documentType": "CONTRACT",
    "status": "COMPLETED",
    "parsedMarkdown": "# 가상전세계약서(데모용)\n\n제1조(목적물)\n서울특별시예시구예시동101-1,101호\n\n제2조(임대차기간)\n2026년9월1일부터2028년8월31일까지(24개월)\n\n제3조(보증금및차임)\n보증금:금이억원(200,000,000원),월차임없음.\n\n본문서는PRISM시연을위한예시계약서입니다.\n\n제4조(계약금및잔금)\n계약금은보증금의10%로하며,잔금지급과동시에목적물을인도한다.\n\n# 제5조(담보권)\n\n임대인은계약목적물에설정된근저당권및기타제한물권의현황을임차인에게\n고지하여야한다.\n\n# 제6조(등기사항확인)\n\n임차인은계약체결전등기사항전부증명서를확인할수있으며필요한경우관련\n서류의열람을요구할수있다.\n\n# 제7조(전세보증보험)\n\n임차인은전세보증금반환보증가입가능여부를사전에확인하는것을권장한다.\n\n# 제8조(특약)\n\n- ①입주전하자를확인한다.\n- ②계약내용변경시서면합의를원칙으로한다.\n\n\n임대인:(서명)\n임차인:(서명)\n\n*본문서는데모용으로작성된가상의계약서입니다.",
    "analysis": {
        "documentType": "CONTRACT",
        "documentSummary": "이 문서는 서울특별시 예시구 예시동 101-1, 101호를 2026년 9월 1일부터 2028년 8월 31일까지 24개월 동안 보증금 2억 원(월차임 없음)으로 전세계약하는 가상 계약서의 데모 버전이다. 계약금은 보증금의 10%이며, 잔금 지급과 동시에 목적물을 인도한다. 임대인은 계약 목적물에 설정된 근저당권 및 기타 제한물권 현황을 임차인에게 고지해야 하며, 임차인은 계약 체결 전 등기부등본을 확인하고 필요한 경우 서류 열람을 요구할 수 있다. 전세보증보험 가입 가능 여부를 사전 확인할 것을 권장하며, 입주 전 하자 확인과 계약 내용 변경 시 서면 합의를 원칙으로 한다. 서명란에는 임대인과 임차인의 서명이 있다.",
        "frameSummary": "이 계약은 임대인과 임차인의 권리·의무 구조를 명확히 배분하며, 임차인의 사전 확인 의무와 임대인의 고지 의무를 강조하는 구조이다.",
        "frameAnalyses": [
            {
                "originalText": "임대인은계약목적물에설정된근저당권및기타제한물권의현황을임차인에게고지하여야한다.",
                "category": "RESPONSIBILITY",
                "description": "임대인이 계약 목적물에 설정된 근저당권 등 제한물권 현황을 임차인에게 고지해야 하는 법적 의무를 명시한다.",
                "evidence": "고지하여야한다"
            },
            {
                "originalText": "임차인은계약체결전등기사항전부증명서를확인할수있으며필요한경우관련서류의열람을요구할수있다.",
                "category": "ACTION_REQUIRED",
                "description": "임차인이 계약 체결 전 등기부등본을 확인하고 필요한 경우 서류 열람을 요구하는 능동적 행동을 지시한다.",
                "evidence": "확인할수있으며...요구할수있다"
            },
            {
                "originalText": "임차인은전세보증금반환보증가입가능여부를사전에확인하는것을권장한다.",
                "category": "ACTION_REQUIRED",
                "description": "임차인이 전세보증보험 가입 가능 여부를 사전에 확인하는 행동을 권고한다.",
                "evidence": "사전에확인하는것을권장한다"
            },
            {
                "originalText": "입주전하자를확인한다.",
                "category": "ACTION_REQUIRED",
                "description": "임차인이 입주 전 하자 유무를 확인하는 행동을 요구한다.",
                "evidence": "확인한다"
            },
            {
                "originalText": "계약내용변경시서면합의를원칙으로한다.",
                "category": "DECISION_AUTHORITY",
                "description": "계약 내용 변경 시 서면 합의를 필수적인 절차로 규정하여 변경 권한의 행사 방식을 제한한다.",
                "evidence": "서면합의를원칙으로한다"
            }
        ],
        "realityTranslations": [
            {
                "originalText": "임대인은계약목적물에설정된근저당권및기타제한물권의현황을임차인에게고지하여야한다.",
                "easyWords": "임대인은 집에 담보로 설정된 금액이나 권리 상태를 임차인에게 알려줘야 합니다.",
                "realWorldImpact": "임대인이 고지하지 않은 제한물권으로 인해 임차인이 보증금을 돌려받지 못할 위험이 발생할 수 있습니다."
            },
            {
                "originalText": "임차인은계약체결전등기사항전부증명서를확인할수있으며필요한경우관련서류의열람을요구할수있다.",
                "easyWords": "임차인은 계약하기 전 등기부등본을 확인하고, 필요하면 서류도 열람할 수 있습니다.",
                "realWorldImpact": "등기부등본을 확인하지 않으면 집에 설정된 담보나 소유권 문제를 미리 알 수 없어 피해를 입을 수 있습니다."
            },
            {
                "originalText": "임차인은전세보증금반환보증가입가능여부를사전에확인하는것을권장한다.",
                "easyWords": "전세보증보험에 가입할 수 있는지 미리 확인하는 것이 좋습니다.",
                "realWorldImpact": "보험 가입 가능 여부를 확인하지 않으면 보증금을 보호받지 못할 수 있습니다."
            },
            {
                "originalText": "입주전하자를확인한다.",
                "easyWords": "이사하기 전에 집 상태를 꼼꼼히 확인해야 합니다.",
                "realWorldImpact": "입주 전 하자를 확인하지 않으면 퇴실 시 수리비를 부담해야 할 수 있습니다."
            }
        ],
        "actionGuides": [
            {
                "item": "등기사항전부증명서 확인",
                "description": "계약 전 등기부등본을 확인하여 근저당권 설정 여부, 소유자 정보 등을 점검해야 합니다."
            },
            {
                "item": "전세보증보험 가입 가능성 확인",
                "description": "보증금 보호를 위해 보험 가입 가능 여부를 사전에 확인해야 합니다."
            },
            {
                "item": "입주 전 하자 점검 및 사진 촬영",
                "description": "퇴실 시 분쟁을 예방하기 위해 하자 유무를 확인하고 상태를 사진으로 기록해야 합니다."
            },
            {
                "item": "임대인의 제한물권 현황 서면 확인 요청",
                "description": "임대인이 고시한 근저당권 등 제한물권 현황을 서면으로 받아 보관해야 합니다."
            }
        ]
    },
    "errorMessage": null,
    "createdAt": "2026-07-31T10:48:29.3781215"
  }
  ```

- **api/documents/{documentId}/chat (문서 기반 Q&A(챗봇) 기능) 테스트**
  - Response 결과 JSON 데이터 샘플
  ```json
  {
    "documentId": 1,
    "question": "전세보증보험 가입 여부 확인하라고 했는데 어떻게 확인해?",
    "answer": "**답변:**  \n전세보증보험 가입 가능 여부는 임차인이 사전에 직접 확인해야 합니다.  \n\n**근거 및 설명:**  \n- 문서 제7조(\"전세보증보험\")에 따르면,  \n  > *\"임차인은 전세보증금반환보증가입 가능여부를 사전에 확인하는 것을 권장한다.\"*  \n- 이는 임대인이 아닌 **임차인 본인**이 보증보험 가입 가능성을 확인해야 함을 명시합니다.  \n- 일반적으로 금융기관(은행, 보험사 등)이나 주택도시보증공사(HUG)에 문의하여 전세보증보험 가입 조건(예: 부동산 가격, 임대인 동의 등)을 확인할 수 있습니다.  \n\n**추가 설명:**  \n- 전세보증보험은 보증금의 일부 또는 전액을 보장받는 보험으로, 계약 시 반드시 가입 가능 여부를 확인하는 것이 안전합니다.  \n- 본 계약서에는 보험 가입 의무 조항이 없으므로, 임차인의 선택에 따라 진행됩니다."
  }
  ```

### 2-2. Prompt Engineering 명세
#### [기능 1: 문서 요약 및 Document Frame Analysis & Reality Translation & actionGuides]
- **Target Model**: `solar-pro2`
- **호출 방식**: `response_format: json_schema` 구조화 출력 (`DocumentAnalysisSchema`)
- **User Prompt** (실제 사용 프롬프트 요지):
  > "당신은 문서 요약과 세 가지 서로 독립적인 분석을 수행하는 어시스턴트입니다. 같은 문장이 세 분석 모두에 선택될 수도 있고, 한쪽에만 선택될 수도 있습니다.
  >
  > [문서 요약 규칙] 분량 제한이 없음. 문장 수를 임의로 줄이지 말고, 문서에 담긴 주요    조항·조건·금액·기간 등 핵심 정보를 빠짐없이 포함해 독자가 원문 전체를 읽지 않아도
    내용을 정확히 파악할 수 있을 만큼 충분히 상세하게 작성.
  >
  > [분석 1: 프레임 분석] 계약서·약관·공고문 등 실용문서의 권리·의무 구조만 분석 (현실 번역·행동 가이드·법률 자문은 하지 않음). 아래 6개 프레임(RESPONSIBILITY/DECISION_AUTHORITY/RISK/ACTION_REQUIRED/HIDDEN_CONDITION/BENEFIT_LIMITATION) 각각에 대해 정의(Definition)·판단 기준(Decision Rules)·언어적 특징(Linguistic Indicators)·인접 프레임과의 경계 규칙(Boundary Rules)을 프레임별로 명시. 분석 절차는 "문장을 읽는다 → 정의·판단 기준과 비교한다 → 가장 적합한 Frame을 선택한다 → evidence(핵심 표현)를 추출한다 → description을 작성한다"의 5단계로 지시. 입력되지 않은 내용은 추론하지 않으며, 한 문장에 여러 Frame이 존재하면 각각 독립 항목으로 분석하고 해당하는 Frame이 없으면 제외.
  >
  > [분석 2: 현실 번역] 조항이 현실에서 어떤 구체적 상황을 만들 수 있는지 쉬운 말과 실제 발생 가능한 상황으로 번역. 구조 판정은 하지 않음.
  >
  > [분석 3: 행동 가이드] 분석 1·2와 달리 원문 인용이 필요 없음. documentType과 문서 전체 맥락을 참고하여, 사용자가 문서와 관련해 실제로 확인하거나 실행해야 할 구체적 항목을 체크리스트 형태로 3~6개 제시. 문서 밖에서 확인해야 하는 사항(예: 등기부등본 확인)과 문서를 받은 뒤 실행해야 하는 행동(예: 입주 전 사진 촬영)을 구분 없이 하나의 목록으로 자연스럽게 제시. "계약서를 꼼꼼히 읽어보세요"처럼 뻔하거나 일반론적인 항목은 제외.
  >
  > [공통 규칙] frameAnalyses·realityTranslations의 originalText는 문서 원문을 한 글자도 바꾸지 않고 그대로 복사 (프론트엔드 하이라이트 매칭용). frameAnalyses의 evidence는 originalText 안에서 판정 근거가 되는 핵심 표현만 원문 그대로 짧게 추출 (originalText보다 짧거나 같음). description은 1~2문장으로 권리·의무 구조만 설명하고, 원문을 그대로 반복하거나 사용자에게 조언하지 않음. 서명란·절차적 안내 문구 등은 제외."
- **Few-shot 예시** (카테고리당 1개, 총 6개로 축약하여 병합 — RESPONSIBILITY/DECISION_AUTHORITY/RISK/ACTION_REQUIRED/HIDDEN_CONDITION/BENEFIT_LIMITATION 각 1개씩):
  - 원문: `"원상복구 비용은 임차인이 부담한다."`
    - 프레임 분석 → `category: RESPONSIBILITY`, `description: "임대차 종료 시 목적물 훼손 부분에 대한 원상복구 재정 지출의 주체를 임차인으로 못박아 재정 책임을 배분한다."`, `evidence: "임차인이 부담한다"`
    - 현실 번역 → `easyWords: "원상복구 의무가 있습니다."`, `realWorldImpact: "퇴실 시 벽지나 바닥의 작은 훼손도 수리비 청구 대상이 될 수 있고, 비용 기준이 명확하지 않다면 분쟁이 발생할 가능성이 있습니다."`
  - 원문: `"필수 문서 미제출 시 평가 제외됨"`
    - 프레임 분석 → `category: RISK`, `description: "규정된 첨부서류의 미제출로 인해 제안서의 질적 수준과 무관하게 신청 자격이 즉각 무효 처리되는 행정적 상실 위험을 서술한다."`, `evidence: "평가 제외됨"`
  - 원문: `"계약 종료 후 30일 이내 보증금을 반환한다."`
    - 현실 번역 → `easyWords: "계약 종료 후 바로 보증금을 받을 수 있는 것은 아닙니다. 최대 30일까지 기다려야 할 수 있습니다."`, `realWorldImpact: "새로운 집 계약금을 준비해야 하는 상황이라면 자금 계획이 필요할 수 있습니다."`
  - 문서 종류: 부동산 계약서 (documentType: CONTRACT)
    - 행동 가이드 → `item: "등기사항전부증명서 확인"`, `description: "근저당권 등 숨은 부담 확인을 위해 반드시 등기부등본을 확인해야 합니다."`
    - 행동 가이드 → `item: "입주 전 사진 촬영 및 하자 기록"`, `description: "퇴실 시 분쟁 방지를 위해 입주 전 상태를 사진/영상으로 기록하고 확인 받아야 합니다."`
- **Output 스키마 구조**:
  ```json
  {
    "documentType": "CONTRACT | JOB_POSTING | GOV_SUPPORT | INSURANCE | PRIVACY_CONSENT | OTHER",
    "documentSummary": "string",
    "frameSummary": "string",
    "frameAnalyses": [
      { "originalText": "string", "category": "RESPONSIBILITY | RISK | DECISION_AUTHORITY | ACTION_REQUIRED | HIDDEN_CONDITION | BENEFIT_LIMITATION", "description": "string", "evidence": "string" }
    ],
    "realityTranslations": [
      { "originalText": "string", "easyWords": "string", "realWorldImpact": "string" }
    ],
    "actionGuides": [
      { "item": "string", "description": "string" }
    ]
  }
  ```

#### [기능 2: 문서 기반 Q&A(챗봇)]
- **Target Model**: `solar-pro2`
- **호출 방식**: 일반 Chat Completions (`response_format` 미사용, 구조화 출력 없이 자유 서술형 답변)
- **User Prompt** (실제 사용 프롬프트 요지):
  > "당신은 사용자가 업로드한 문서의 내용을 바탕으로 질문에 답하는 어시스턴트입니다.
  >
  > [규칙] 반드시 아래 제공된 문서 내용에 근거해서만 답변할 것. 문서에 명시되지 않은 내용은 추측하지 말고 "문서에 명시되어 있지 않습니다"라고 답할 것. 법률/전문 용어가 있다면 일반인이 이해하기 쉬운 말로 풀어서 설명할 것. 답변은 간결하되, 필요한 근거(관련 원문 조항 요약 포함)를 함께 제시할 것.
  >
  > [문서 내용] {parsedMarkdown 전체}
  >
  > [사용자 질문] {question}"
- **Few-shot 예시**:
  - 질문: `"보증금은 언제 돌려받을 수 있나요?"`
    - 답변 → "문서에 별도 반환 시점이 명시되어 있지 않습니다. 계약 종료 후 반환 절차를 임대인과 확인하시는 것을 권장합니다." (문서에 없는 내용을 추측해 답하지 않고, 명시 여부를 우선 확인하는 방식)
- **Output 구조**: 별도 JSON Schema 없이 자유 텍스트 답변을 생성하며, `DocumentChatResponse`(`documentId`, `question`, `answer`) DTO로 감싸 반환
  ```json
  {
    "documentId": "number",
    "question": "string",
    "answer": "string"
  }
  ```

### 2-3. 백엔드 구현 소스코드 위치
- Upstage 인증/WebClient 설정: `config/UpstageProperties.java`, `config/UpstageWebClientConfig.java`
- Document Parse / Solar Chat 호출: `upstage/UpstageService.java` (`parseDocumentAsJson()`, `analyzeDocument()`)
- 문서 기반 Q&A(챗봇) 호출: `upstage/UpstageService.java` (`chatAboutDocument()`)
- 응답 JSON Schema 정의(요약 포함): `document/DocumentAnalysisSchema.java`
- 문서 업로드 → Parse → 분석 → 저장 오케스트레이션: `document/DocumentService.java` (`analyze()`)
- 문서 기반 Q&A 오케스트레이션: `document/DocumentService.java` (`chat()`)
- API 엔드포인트: `document/DocumentController.java` (`POST /api/documents`, `GET /api/documents/{id}`, `POST /api/documents/{id}/chat`)
- 영속성 계층: `document/Document.java`(Entity), `document/DocumentRepository.java`, `document/DocumentResponse.java`(DTO)
- Q&A 요청/응답 DTO: `document/DocumentChatRequest.java`, `document/DocumentChatResponse.java`
- 업로드 파일 서버 사이드 검증: `document/DocumentUploadValidator.java`
- API 전역 예외 처리(일관된 JSON 에러 응답): `common/GlobalExceptionHandler.java`
- 업로드 크기 제한 설정: `application.yaml` (`spring.servlet.multipart.max-file-size`/`max-request-size`)
- 프론트엔드 번들링/배포 패키징 구성: `build.gradle` (`jar`/`bootJar` 태스크의 프론트 `dist` 포함 로직)
