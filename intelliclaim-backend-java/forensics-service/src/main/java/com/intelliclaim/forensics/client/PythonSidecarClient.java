package com.intelliclaim.forensics.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@FeignClient(name = "python-sidecar", url = "${python.sidecar.url}")
public interface PythonSidecarClient {

    @PostMapping(value = "/api/v1/forensics/weather", consumes = "application/json")
    Map<String, Object> verifyWeather(@RequestBody Map<String, Object> request);

    @PostMapping(value = "/api/v1/forensics/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Map<String, Object> analyzeVoice(@RequestPart("file") MultipartFile file);
}
