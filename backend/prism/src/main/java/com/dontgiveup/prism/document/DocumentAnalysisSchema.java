package com.dontgiveup.prism.document;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class DocumentAnalysisSchema {

    private DocumentAnalysisSchema() {}

    public static Map<String, Object> get() {

        Map<String, Object> frameAnalysisProps = new LinkedHashMap<>();
        frameAnalysisProps.put("originalText", Map.of(
                "type", "string",
                "description", "문서 원문에 실제로 존재하는 문장/구절을 한 글자도 바꾸지 않고 그대로 복사한 것"
        ));
        frameAnalysisProps.put("category", Map.of(
                "type", "string",
                "enum", List.of("RESPONSIBILITY", "RISK", "DECISION_AUTHORITY",
                        "ACTION_REQUIRED", "HIDDEN_CONDITION", "BENEFIT_LIMITATION"),
                "description", "책임소재/위험부담/결정권/행동요구/숨은조건/혜택제한 중 이 조항이 해당하는 구조적 프레임"
        ));
        frameAnalysisProps.put("interpretation", Map.of(
                "type", "string",
                "description", "이 조항이 책임/권리/위험/혜택/선택/행동을 누구에게 어떻게 배치하는지에 대한 구조적 해석 한 문장"
        ));

        Map<String, Object> frameAnalysisItem = new LinkedHashMap<>();
        frameAnalysisItem.put("type", "object");
        frameAnalysisItem.put("properties", frameAnalysisProps);
        frameAnalysisItem.put("required", List.of("originalText", "category", "interpretation"));


        Map<String, Object> realityTranslationProps = new LinkedHashMap<>();
        realityTranslationProps.put("originalText", Map.of(
                "type", "string",
                "description", "문서 원문에 실제로 존재하는 문장/구절을 한 글자도 바꾸지 않고 그대로 복사한 것"
        ));
        realityTranslationProps.put("easyWords", Map.of(
                "type", "string",
                "description", "원문을 일반인이 바로 이해할 수 있는 쉬운 말 한 문장으로 풀어쓴 것"
        ));
        realityTranslationProps.put("realWorldImpact", Map.of(
                "type", "string",
                "description", "이 조항 때문에 사용자에게 실제로 발생할 수 있는 구체적 상황 한 문장"
        ));

        Map<String, Object> realityTranslationItem = new LinkedHashMap<>();
        realityTranslationItem.put("type", "object");
        realityTranslationItem.put("properties", realityTranslationProps);
        realityTranslationItem.put("required", List.of("originalText", "easyWords", "realWorldImpact"));


        Map<String, Object> actionGuideItemProps = new LinkedHashMap<>();
        actionGuideItemProps.put("item", Map.of(
                "type", "string",
                "description", "체크리스트에 표시할 짧은 항목명 (예: '등기부등본 확인', '입주 전 사진 촬영')"
        ));
        actionGuideItemProps.put("description", Map.of(
                "type", "string",
                "description", "이 항목이 왜 필요한지, 어떤 위험을 예방하거나 어떤 불이익을 막을 수 있는지에 대한 한 문장 설명"
        ));

        Map<String, Object> actionGuideItem = new LinkedHashMap<>();
        actionGuideItem.put("type", "object");
        actionGuideItem.put("properties", actionGuideItemProps);
        actionGuideItem.put("required", List.of("item", "description"));


        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("documentType", Map.of(
                "type", "string",
                "enum", List.of("CONTRACT", "JOB_POSTING", "GOV_SUPPORT",
                        "INSURANCE", "PRIVACY_CONSENT", "OTHER"),
                "description", "문서 종류 추정"
        ));
        properties.put("documentSummary", Map.of(
                "type", "string",
                "description", "문서가 어떤 내용인지 2~3문장으로 요약 (내용 요약)"
        ));
        properties.put("frameSummary", Map.of(
                "type", "string",
                "description", "frameAnalyses 전체를 관통하는, 이 문서가 책임/위험/결정권을 어떻게 배치하는지에 대한 한 줄 총평"
        ));
        properties.put("frameAnalyses", Map.of(
                "type", "array",
                "items", frameAnalysisItem,
                "description", "구조적 프레임(책임/위험/결정권/행동요구/숨은조건/혜택제한)이 뚜렷하게 드러나는 조항만 선별한 목록"
        ));
        properties.put("realityTranslations", Map.of(
                "type", "array",
                "items", realityTranslationItem,
                "description", "실생활에 구체적 영향을 주는 조항만 선별하여 쉬운 말과 실제 발생 가능한 상황으로 번역한 목록"
        ));
        properties.put("actionGuides", Map.of(
                "type", "array",
                "items", actionGuideItem,
                "description", "문서 종류(documentType)에 맞춰, 사용자가 문서 밖에서 추가로 확인해야 할 사항과 " +
                        "문서를 받은 이후 실제로 취해야 할 행동을 함께 제시하는 체크리스트"
        ));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", List.of("documentType", "documentSummary", "frameSummary",
                "frameAnalyses", "realityTranslations", "actionGuides"));
        return schema;
    }
}
