package com.tool.atkdefbackend.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Client for Checker-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckerClient {

    private final CoreApiClient coreApiClient;

    /**
     * Upload a checker script.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadChecker(String name, String description, MultipartFile file) throws IOException {
        log.info("Uploading checker: {}", name);
        
        // Build endpoint with query parameters (Core API expects name/description as query params)
        StringBuilder endpoint = new StringBuilder("/checkers?name=")
            .append(java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8));
        if (description != null && !description.isEmpty()) {
            endpoint.append("&description=")
                .append(java.net.URLEncoder.encode(description, java.nio.charset.StandardCharsets.UTF_8));
        }
        
        // Only file in multipart body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });
        
        return coreApiClient.postMultipart(endpoint.toString(), body, Map.class);
    }

    /**
     * List all checkers.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> listCheckers(int skip, int limit) {
        return coreApiClient.get(String.format("/checkers?skip=%d&limit=%d", skip, limit), Map.class);
    }

    /**
     * Get checker by ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getChecker(UUID checkerId) {
        return coreApiClient.get("/checkers/" + checkerId, Map.class);
    }

    /**
     * Delete checker.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteChecker(UUID checkerId) {
        log.info("Deleting checker: {}", checkerId);
        return coreApiClient.delete("/checkers/" + checkerId, Map.class);
    }
}
