package com.dontgiveup.prism.upstage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;

@RestController
@RequestMapping("/api/upstage")
public class UpstageTestController {

    private final UpstageService upstageService;

    public UpstageTestController(UpstageService upstageService) {
        this.upstageService = upstageService;
    }

    @GetMapping("/chat-test")
    public Mono<ResponseEntity<String>> chatTest() {
        return upstageService.chat("안녕하세요, 연결 테스트입니다.")
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.internalServerError().body("Upstage 호출 실패: " + e.getMessage())
                ));
    }

    @PostMapping(value = "/parse-test", consumes = "multipart/form-data")
    public Mono<ResponseEntity<String>> parseTest(@RequestParam("document") MultipartFile document) {
        try {
            return upstageService.parseDocument(document)
                    .map(ResponseEntity::ok)
                    .onErrorResume(e -> Mono.just(
                            ResponseEntity.internalServerError().body("Upstage 호출 실패: " + e.getMessage())
                    ));
        } catch (IOException e) {
            return Mono.just(ResponseEntity.internalServerError().body("파일 처리 실패: " + e.getMessage()));
        }
    }
}
