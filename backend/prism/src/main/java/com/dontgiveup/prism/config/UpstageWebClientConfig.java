package com.dontgiveup.prism.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class UpstageWebClientConfig {

    @Bean
    @Qualifier("upstageWebClient")
    public WebClient upstageWebClient(UpstageProperties properties) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            System.out.println("[WARN] UPSTAGE_API_KEY가 비어있습니다. .env를 확인하세요.");
        }
        return WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                .build();
    }
}
