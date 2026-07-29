package com.dontgiveup.prism.document;

import com.dontgiveup.prism.upstage.UpstageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.NoSuchElementException;

@Service
public class DocumentService {

    private final UpstageService upstageService;
    private final DocumentRepository documentRepository;

    public DocumentService(UpstageService upstageService, DocumentRepository documentRepository) {
        this.upstageService = upstageService;
        this.documentRepository = documentRepository;
    }

    public Mono<DocumentResponse> uploadAndParse(MultipartFile file, DocumentType documentType) {
        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        doc.setDocumentType(documentType);
        doc.setStatus(DocumentStatus.PARSING);
        documentRepository.save(doc);

        try {
            return upstageService.parseDocumentAsJson(file)
                    .map(parseResult -> {
                        String markdown = parseResult.at("/content/markdown").asText();
                        doc.setParsedMarkdown(markdown);
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

    private DocumentResponse toResponse(Document doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getFileName(),
                doc.getDocumentType(),
                doc.getStatus(),
                doc.getParsedMarkdown(),
                doc.getErrorMessage(),
                doc.getCreatedAt()
        );
    }
}
