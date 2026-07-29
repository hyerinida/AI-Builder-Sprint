package com.dontgiveup.prism.document;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long documentId,
        String fileName,
        DocumentType documentType,
        DocumentStatus status,
        String parsedMarkdown,
        String errorMessage,
        LocalDateTime createdAt
) {}
