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
            문서가 책임과 권리, 위험과 혜택, 선택과 행동을 누구에게 어떻게 배치하는지
            구조적으로 판정하는 작업입니다. "이 문장이 실생활에서 무슨 일을 일으키는가"가
            아니라 "이 문장이 책임/위험/결정권을 누구에게 집중시키는가"를 봅니다.

            선별 기준: 아래 6개 프레임 중 하나가 뚜렷하게 드러나는 조항만 고르세요.
            - RESPONSIBILITY(책임 집중): 누구에게 책임이 집중되는가?
            - RISK(위험 부담): 누가 위험을 부담하는가?
            - DECISION_AUTHORITY(결정권): 누가 결정권을 가지는가?
            - ACTION_REQUIRED(행동 요구): 어떤 행동을 요구하는가?
            - HIDDEN_CONDITION(숨은 조건): 어떤 조건이 숨겨져 있는가?
            - BENEFIT_LIMITATION(혜택 제한): 혜택보다 제한이 많은가?

            예시:
            - 원문: "원상복구 비용은 임차인이 부담한다."
              category: RESPONSIBILITY
              interpretation: "이 계약은 시설 훼손에 대한 책임을 임차인에게 집중시키는 구조입니다."
            - 원문: "사고 발생 시 책임은 이용자에게 있다."
              category: RISK
              interpretation: "사고 발생 시 위험 부담이 사용자에게 집중되어 있습니다."
            - 원문: "회사 사정에 따라 일정은 변경될 수 있다."
              category: DECISION_AUTHORITY
              interpretation: "일정 변경 권한이 회사에 있으며 사용자는 이를 수용해야 할 가능성이 있습니다."

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

            아래 문서 전체를 대상으로 두 분석을 각각 독립적으로 수행해줘:

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
}
