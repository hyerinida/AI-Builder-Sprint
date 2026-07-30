package com.dontgiveup.prism.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Prism API", version = "v1", description = "AI Builder Sprint 2026 Prism 서비스 백엔드 API 명세"),
        servers = { @Server(url = "/", description = "기본 서버 환경") }
)
public class OpenApiConfig {}
