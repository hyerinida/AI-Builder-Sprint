package com.dontgiveup.prism.upstage;

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
}
