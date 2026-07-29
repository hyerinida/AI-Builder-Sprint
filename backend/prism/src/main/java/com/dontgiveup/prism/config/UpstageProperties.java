package com.dontgiveup.prism.config;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "upstage")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UpstageProperties {
    private String apiKey;
    private String baseUrl;
}
