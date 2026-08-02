package com.dontgiveup.prism.document;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

/**
 * 문서 업로드 시 서버 사이드에서 파일을 검증한다.
 * 프론트엔드(UploadArea)에서도 accept 속성으로 1차 필터링을 하지만,
 * API를 직접 호출하는 경우를 대비해 백엔드에서도 동일한 기준으로 재검증한다.
 */
@Component
public class DocumentUploadValidator {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/jpg", "image/png"
    );

    private static final long MAX_FILE_SIZE_BYTES = 15L * 1024 * 1024; // 15MB

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("파일 크기는 15MB를 초과할 수 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 형식입니다. PDF, JPEG, PNG 파일만 업로드할 수 있습니다.");
        }
    }
}
