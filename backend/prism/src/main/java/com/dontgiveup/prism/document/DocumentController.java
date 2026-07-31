package com.dontgiveup.prism.document;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Operation(summary = "문서 OCR 및 프레임분석, 현실번역", description = "업로드한 문서를 텍스트로 변환 및 프레임분석, 현실번역 후 JSON으로 결과를 반환합니다")
    @PostMapping(consumes = "multipart/form-data")
    public Mono<ResponseEntity<DocumentResponse>> upload(@RequestParam("file") MultipartFile file) {
        return documentService.analyze(file).map(ResponseEntity::ok);
    }

    @Operation(summary = "이전에 업로드한 문서 분석 결과 다시보기", description = "이전에 업로드한 문서의 OCR, 프레임분석, 현실번역이 완료된 JSON 결과를 반환합니다")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @Operation(summary = "문서 내용 기반 질의응답", description = "업로드된 문서 내용을 바탕으로 사용자의 질문에 답변합니다")
    @PostMapping("/{id}/chat")
    public Mono<ResponseEntity<DocumentChatResponse>> chat(
            @PathVariable Long id,
            @RequestBody DocumentChatRequest request) {
        return documentService.chat(id, request.question())
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body(
                                new DocumentChatResponse(id, request.question(), "오류: " + e.getMessage()))));
    }
}
