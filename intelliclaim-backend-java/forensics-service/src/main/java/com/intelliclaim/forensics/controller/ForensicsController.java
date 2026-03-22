package com.intelliclaim.forensics.controller;

import com.intelliclaim.forensics.client.PythonSidecarClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/forensics")
@RequiredArgsConstructor
public class ForensicsController {

    private final PythonSidecarClient sidecarClient;

    @PostMapping("/weather")
    public ResponseEntity<Map<String, Object>> verifyWeather(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(sidecarClient.verifyWeather(request));
    }

    @PostMapping(value = "/voice", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> analyzeVoice(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(sidecarClient.analyzeVoice(file));
    }
}
