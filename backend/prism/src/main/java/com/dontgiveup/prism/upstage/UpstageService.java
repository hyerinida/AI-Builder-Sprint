package com.dontgiveup.prism.upstage;

import com.dontgiveup.prism.document.DocumentAnalysisSchema;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class UpstageService {

    private final WebClient upstageWebClient;

    public UpstageService(@Qualifier("upstageWebClient") WebClient upstageWebClient) {
        this.upstageWebClient = upstageWebClient;
    }

    public Mono<String> parseDocument(MultipartFile document) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("document", document.getResource());
        builder.part("model", "document-parse");

        return upstageWebClient.post()
                .uri("/v1/document-digitization")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class);
    }

    public Mono<String> chat(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "solar-pro2",
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        return upstageWebClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class);
    }

    public Mono<JsonNode> parseDocumentAsJson(MultipartFile document) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("document", document.getResource());
        builder.part("model", "document-parse");
        builder.part("output_formats", "['markdown']");

        return upstageWebClient.post()
                .uri("/v1/document-digitization")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException(
                                        "Upstage 오류 응답: " + body))))
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> analyzeDocument(String documentMarkdown) {
        String prompt = """
            당신은 문서 요약과 세 가지 서로 독립적인 분석을 수행하는 어시스턴트입니다.
            같은 문장이 세 분석 모두에 선택될 수도 있고, 한쪽에만 선택될 수도 있습니다.
            각 분석은 서로 다른 기준으로 별도로 조항을 선별하세요.
            
            ==========================================
            [요약 규칙 (documentSummary)]
            documentSummary는 분량 제한이 없습니다. 문장 수를 임의로 줄이지 말고, 문서에 담긴
            주요 조항·조건·금액·기간 등 핵심 정보를 빠짐없이 포함해 독자가 원문 전체를 읽지 않아도
            내용을 정확히 파악할 수 있을 만큼 충분히 상세하게 작성하세요.
            
            ==========================================
            [분석 1: 프레임 분석 (frameAnalyses)]
            당신은 계약서, 약관, 공고문 등 실용문서의 프레임을 분석합니다.
            문장에서 정의된 6개의 Frame을 식별하며, 현실 번역·행동 가이드·법률 자문은 하지 않고
            문장의 권리·의무 구조만 분석합니다.

            목적: 입력된 문장에서 계약 주체 간의 권리 비대칭성과 제어 구조를 식별하고,
            아래 6개 프레임(RESPONSIBILITY, DECISION_AUTHORITY, RISK, ACTION_REQUIRED,
            HIDDEN_CONDITION, BENEFIT_LIMITATION) 중 해당하는 프레임을 구조적으로 매핑합니다.

            분석 절차: ① 문장을 읽는다 → ② 아래 정의·판단 기준과 비교한다 → ③ 가장 적합한 Frame을
            선택한다 → ④ evidence(핵심 표현)를 추출한다 → ⑤ description을 작성한다.

            ## RESPONSIBILITY (책임 귀속)
            정의: 특정 행위·유지보수·결과에 대한 법적/재정적/절차적 책임을 특정 행위자에게 귀속시키는 언어.
            판단 기준: 손해·문제에 대한 법적/재정적 책임 주체 명시 / 배상·복구·비용 부담의 배분 /
            연대책임 설정 / 기관의 관리 의무 정의 / 사고 결과를 누가 감수하는지 선언.
            언어적 특징: 책임, 부담한다, 연대로 합니다, 의무를 집니다, 배상한다, 원상복구, 관리 책임
            경계: RISK는 위반 시의 부정적 결과·제재에 초점 / ACTION_REQUIRED는 사용자가 선제적으로
            수행할 직접 행위 / DECISION_AUTHORITY는 일방적으로 변경·승인·거부할 권한의 주체.

            ## DECISION_AUTHORITY (결정권)
            정의: 특정 당사자(주로 제공자)에게 일방적인 의사결정·변경·해석 권한을 부여하는 언어.
            판단 기준: 조건·일정·가격의 일방적 수정 권한 / 제공자의 사전 동의·승인 요구 /
            반려·취소·환불의 최종 권한 / 내부 규정에 따른 프로세스 실행 / 동의 없는 서비스 중지·종료 재량.
            언어적 특징: 승인, 변경할 수 있다, 결정한다, 재량, 판단한다, 반려한다, 승낙을 얻어, 권한이 있음
            경계: RESPONSIBILITY는 이행·배상의 법적 책임 주체 / BENEFIT_LIMITATION은 이미 약속된
            혜택의 구조적 한계 / RISK는 페널티 자체의 결과.

            ## RISK (위험 부담)
            정의: 당사자(주로 사용자)에게 부과되는 부정적 결과·재정적 페널티·권리 박탈·운영상 손실.
            판단 기준: 혜택·자격의 자동 취소·박탈 / 지급·보상·환불 거절 / 보증금 몰수 등 직접적
            재정 페널티 / 미준수 시 서비스 중지·해지 경고 / 기술적 오류·플랫폼 실패 위험의 전가.
            언어적 특징: 취소된다, 무효가 된다, 지급하지 않는다, 환수한다, 제외된다, 해지된다, 불이익, 공제한다
            경계: BENEFIT_LIMITATION은 기존 혜택의 한도·예외 / ACTION_REQUIRED는 결과를 피하기
            위한 필수 행위 / HIDDEN_CONDITION은 사전 자격 기준.

            ## ACTION_REQUIRED (행동 요구)
            정의: 사용자가 혜택 확보·자격 유지·계약 이행을 위해 행해야 하는 능동적·절차적 행동.
            판단 기준: 서류 제출·업로드 요구 / 가입·등록·정보 갱신 지시 / 상태 변경 시 통지 의무 /
            약관 확인·숙지 의무화 / 순차적 절차 안내.
            언어적 특징: 제출하여야 합니다, 신청해야 합니다, 확인하시기 바랍니다, 등록해야 합니다,
            통지하여야 합니다, 숙지하시기 바랍니다
            경계: RESPONSIBILITY는 궁극적 법적 책임 주체 / HIDDEN_CONDITION은 사전에 이미 갖춰야
            하는 고정 기준 / DECISION_AUTHORITY는 결과물을 승인·거절하는 제공자의 판단 권리.

            ## HIDDEN_CONDITION (숨은 조건)
            정의: 혜택을 받거나 권리를 주장하기 전에 충족해야 하는 기존 자격 요건이나 기준.
            판단 기준: 연령·소득·지역 기반 진입 임계치 / 특정 범주 사용자로 자격 제한 / 계약 체결
            이전 조건 충족 시에만 이용 가능 / 소급 평가되는 성과 임계치 / 특정 공법 지배 기관으로 대상 제한.
            언어적 특징: 한하여, 경우에만, 충족해야, 자격, 이상/이하, 한정하여
            경계: BENEFIT_LIMITATION은 이미 시작된 혜택의 실제 범위·한계 / ACTION_REQUIRED는 지금
            선제적으로 완수할 능동적 과업 / RISK는 위반 시의 사후 불이익.

            ## BENEFIT_LIMITATION (혜택 제한)
            정의: 이미 제공되기로 한 혜택이나 권리의 한도·범위·적용 대상·기간·빈도를 제한하는 언어.
            판단 기준: 재정적 지원·배상·보상의 최대 금액 제한 / 혜택의 빈도·기간 제한 / 특정 항목·상황
            제외 / 사후 평가에 따른 혜택 조정·감축 / 특정 상황 발생 시 권리 차단.
            언어적 특징: 최대, 일부, 제외, 한도, 최초 1회, 예산 범위 내, 변동될 수 있음, 다만
            경계: HIDDEN_CONDITION은 사전 진입 자격 요건 / RISK는 위반 시 처벌적 불이익·권리 소멸 /
            ACTION_REQUIRED는 사용자가 이행할 능동적 행동.

            frameAnalyses 원칙: 입력되지 않은 내용을 추론하지 않으며 문장의 구조만 분석합니다.
            하나의 문장에 여러 Frame이 존재하면 각각 독립적인 항목으로 분석합니다.
            해당하는 Frame이 없으면 그 문장은 목록에서 제외합니다.

            description 작성 규칙: 1~2문장으로, 권리·의무 구조만 설명하고, 원문을 그대로 반복하지
            않으며, 사용자에게 조언하지 않습니다.
            evidence 작성 규칙: 핵심 표현만 원문 그대로 추출하고, 불필요한 문장은 포함하지 않습니다.

            frameAnalyses 예시:
            - 원문: "원상복구 비용은 임차인이 부담한다."
              category: RESPONSIBILITY
              description: 임대차 종료 시 목적물 훼손 부분에 대한 원상복구 재정 지출의 주체를 임차인으로
              못박아 재정 책임을 배분한다.
              evidence: "임차인이 부담한다"
            - 원문: "회사는 제휴사 및 금융기관의 시스템 상황에 따라서 서비스의 전부 또는 일부의 제공을
              일시적으로 중단할 수 있습니다."
              category: DECISION_AUTHORITY
              description: 외부 인프라 상황에 대응하여 소비자 동의 없이 공급자가 자의적 판단으로
              서비스를 차단할 수 있는 일방적 유보 권한을 인정한다.
              evidence: "일시적으로 중단할 수 있습니다"
            - 원문: "필수 문서 미제출 시 평가 제외됨"
              category: RISK
              description: 규정된 첨부서류의 미제출로 인해 제안서의 질적 수준과 무관하게 신청 자격이
              즉각 무효 처리되는 행정적 상실 위험을 서술한다.
              evidence: "평가 제외됨"
            - 원문: "보험회사로부터 약관을 수령한 후, 해당 내용을 반드시 확인·숙지하시기 바랍니다."
              category: ACTION_REQUIRED
              description: 사후 분쟁 발생 시 책임을 소비자 개인에게 전이하기 위해, 수령 후 계약 내용을
              스스로 확인하고 이해할 주의 의무를 지시한다.
              evidence: "반드시 확인·숙지하시기 바랍니다"
            - 원문: "본 장학금은 2026년 2학기에 재학 중인 대학생만 지원 가능합니다."
              category: HIDDEN_CONDITION
              description: 장학 수혜 신청자의 대상을 한정하기 위해, 대학생 신분과 특정 학기 소속 여부를
              자격 경계로 삼는다.
              evidence: "대학생만 지원 가능"
            - 원문: "본 혜택은 회원 가입 후 최초 1회에 한하여 적용되며 다른 할인과 중복 적용되지 않습니다."
              category: BENEFIT_LIMITATION
              description: 할인 혜택의 적용 횟수를 1회로 제한하고 다른 할인과의 중복 적용을 차단하여
              실제 수혜 한도를 좁힌다.
              evidence: "최초 1회에 한하여"
            
            ==========================================
            [분석 2: 현실 번역 (realityTranslations)]
            조항을 설명하는 것이 아니라, 그 조항이 현실에서 어떤 구체적 상황을
            만들 수 있는지 보여주는 작업입니다. 구조 판정은 하지 않고, 순수하게
            일반인 입장에서 체감되는 결과만 그립니다.

            선별 기준: 사용자의 실생활에 구체적 영향을 줄 수 있는 조항만 고르세요.

            예시:
            - 원문: "계약 종료 후 30일 이내 보증금을 반환한다."
              easyWords: "계약 종료 후 바로 보증금을 받을 수 있는 것은 아닙니다. 최대 30일까지 기다려야 할 수 있습니다."
              realWorldImpact: "새로운 집 계약금을 준비해야 하는 상황이라면 자금 계획이 필요할 수 있습니다."
            - 원문: "원상복구 비용은 임차인이 부담한다."
              easyWords: "원상복구 의무가 있습니다."
              realWorldImpact: "퇴실 시 벽지나 바닥의 작은 훼손도 수리비 청구 대상이 될 수 있고, 비용 기준이 명확하지 않다면 분쟁이 발생할 가능성이 있습니다."

            ==========================================
            [분석 3: 행동 가이드 (actionGuides)]
            분석 1, 2와 달리 이 작업은 원문 인용이 필요 없습니다. documentType과 문서 전체 맥락을
            참고하여, 사용자가 이 문서와 관련해 실제로 확인하거나 실행해야 할 구체적인 항목을
            체크리스트 형태로 제시하세요. 문서 밖에서 확인해야 하는 사항(예: 등기부등본 확인,
            우대조건 충족 여부)과 문서를 받은 뒤 실행해야 하는 행동(예: 입주 전 사진 촬영,
            제출 서류 체크)을 구분 없이 하나의 목록으로 자연스럽게 섞어 제시하면 됩니다.

            예 (부동산 계약서): 등기부등본 확인, 근저당 설정 여부 확인, 입주 전 사진 촬영,
                기존 하자 기록, 퇴실 전 상태 점검
            예 (채용공고): 지원 자격 재확인, 우대조건 충족 여부 확인, 제출 서류 체크,
                근무지 실주소 확인

            선별 기준: documentType에 맞는 실질적이고 구체적인 항목만 3~6개 제시하세요.
            "계약서를 꼼꼼히 읽어보세요"처럼 뻔하거나 일반론적인 항목은 제외하세요.

            ==========================================
            [공통 원문 인용 규칙]
            - originalText는 문서에 실제로 쓰여있는 문장/구절을 한 글자도 바꾸지 않고 그대로 복사하세요.
            - 프론트엔드가 이 문자열로 원문에서 위치를 찾아 하이라이트합니다.

            [제외 기준 - 두 분석 모두 아래는 제외하세요]
            - 서명란, 날짜 기재란처럼 단순 형식적인 문구
            - 절차적 안내 문구 (예: "본 계약은 2부 작성하여 각 1부씩 보관한다")
            - 위험이나 특별한 해석 없이 사실만 나열하는 문장 (예: 단순 주소, 단순 금액 표기)

            그리고 frameSummary에는 frameAnalyses 전체를 관통하는 이 문서의 구조적 총평을
            한 문장으로 작성하세요 (예: "이 계약은 책임과 위험이 사용자에게 집중되는 구조입니다.").

            아래 문서 전체를 대상으로 문서 요약과 세 분석을 각각 독립적으로 수행해줘:

            """ + documentMarkdown;

        Map<String, Object> requestBody = Map.of(
                "model", "solar-pro2",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "response_format", Map.of(
                        "type", "json_schema",
                        "json_schema", Map.of(
                                "name", "document_analysis_schema",
                                "schema", DocumentAnalysisSchema.get()
                        )
                )
        );

        return upstageWebClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException(
                                        "Upstage 오류 응답: " + body))))
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> chatAboutDocument(String documentMarkdown, String question) {
        String prompt = """
        당신은 사용자가 업로드한 문서의 내용을 바탕으로 질문에 답하는 어시스턴트입니다.

        [규칙]
        - 반드시 아래 제공된 문서 내용에 근거해서만 답변하세요.
        - 문서에 명시되지 않은 내용은 추측하지 말고 "문서에 명시되어 있지 않습니다"라고 답하세요.
        - 법률/전문 용어가 있다면 일반인이 이해하기 쉬운 말로 풀어서 설명하세요.
        - 답변은 간결하되, 필요한 근거(관련 원문 조항 요약 포함)를 함께 제시하세요.

        [문서 내용]
        %s

        [사용자 질문]
        %s
        """.formatted(documentMarkdown, question);

        Map<String, Object> requestBody = Map.of(
                "model", "solar-pro2",
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        return upstageWebClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException(
                                        "Upstage 오류 응답: " + body))))
                .bodyToMono(JsonNode.class);
    }
}
