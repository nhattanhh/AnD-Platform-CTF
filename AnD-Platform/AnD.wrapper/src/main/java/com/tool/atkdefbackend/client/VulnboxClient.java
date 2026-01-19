package com.tool.atkdefbackend.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Client for Vulnbox-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VulnboxClient {

    private final CoreApiClient coreApiClient;

    /**
     * Upload a vulnbox docker image.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadVulnbox(String name, String description, MultipartFile file) throws IOException {
        log.info("Uploading vulnbox: {}", name);
        
        // Build endpoint with query parameters (Core API expects name/description as query params)
        StringBuilder endpoint = new StringBuilder("/vulnboxes?name=")
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
     * List all vulnboxes.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> listVulnboxes(int skip, int limit) {
        return coreApiClient.get(String.format("/vulnboxes?skip=%d&limit=%d", skip, limit), Map.class);
    }

    /**
     * Get vulnbox by ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getVulnbox(UUID vulnboxId) {
        return coreApiClient.get("/vulnboxes/" + vulnboxId, Map.class);
    }

    /**
     * Delete vulnbox.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteVulnbox(UUID vulnboxId) {
        log.info("Deleting vulnbox: {}", vulnboxId);
        return coreApiClient.delete("/vulnboxes/" + vulnboxId, Map.class);
    }
}
