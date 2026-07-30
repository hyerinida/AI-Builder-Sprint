package com.dontgiveup.prism.document;

import com.dontgiveup.prism.upstage.UpstageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.NoSuchElementException;

@Service
public class DocumentService {

    private final UpstageService upstageService;
    private final DocumentRepository documentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DocumentService(UpstageService upstageService, DocumentRepository documentRepository) {
        this.upstageService = upstageService;
        this.documentRepository = documentRepository;
    }

    public Mono<DocumentResponse> analyze(MultipartFile file) {
        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        doc.setStatus(DocumentStatus.PARSING);
        documentRepository.save(doc);

        try {
            return upstageService.parseDocumentAsJson(file)
                    .flatMap(parseResult -> {
                        String markdown = parseResult.at("/content/markdown").asText();
                        doc.setParsedMarkdown(markdown);
                        doc.setStatus(DocumentStatus.ANALYZING);
                        documentRepository.save(doc);
                        return upstageService.analyzeDocument(markdown);
                    })
                    .map(analyzeResult -> {
                        String content = analyzeResult.at("/choices/0/message/content").asText();
                        doc.setAnalysisResultJson(content);
                        doc.setDocumentType(extractDocumentType(content));
                        doc.setStatus(DocumentStatus.COMPLETED);
                        documentRepository.save(doc);
                        return toResponse(doc);
                    })
                    .onErrorResume(e -> {
                        doc.setStatus(DocumentStatus.FAILED);
                        doc.setErrorMessage(e.getMessage());
                        documentRepository.save(doc);
                        return Mono.just(toResponse(doc));
                    });
        } catch (IOException e) {
            doc.setStatus(DocumentStatus.FAILED);
            doc.setErrorMessage(e.getMessage());
            documentRepository.save(doc);
            return Mono.just(toResponse(doc));
        }
    }

    public DocumentResponse getById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("문서를 찾을 수 없습니다: id=" + id));
        return toResponse(doc);
    }

    private DocumentType extractDocumentType(String analysisJson) {
        try {
            JsonNode parsed = objectMapper.readTree(analysisJson);
            return DocumentType.valueOf(parsed.get("documentType").asText());
        } catch (Exception e) {
            return DocumentType.OTHER;
        }
    }

    private DocumentResponse toResponse(Document doc) {
        Object analysis = null;
        if (doc.getAnalysisResultJson() != null) {
            try {
                analysis = objectMapper.readValue(doc.getAnalysisResultJson(), Object.class);
            } catch (Exception e) {
                analysis = doc.getAnalysisResultJson();
            }
        }
        return new DocumentResponse(
                doc.getId(),
                doc.getFileName(),
                doc.getDocumentType(),
                doc.getStatus(),
                doc.getParsedMarkdown(),
                analysis,
                doc.getErrorMessage(),
                doc.getCreatedAt()
        );
    }
}
