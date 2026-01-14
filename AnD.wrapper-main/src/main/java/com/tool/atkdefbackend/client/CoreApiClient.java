package com.tool.atkdefbackend.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tool.atkdefbackend.exception.CoreApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/**
 * Base HTTP client for communication with Python Core API.
 * 
 * Provides type-safe methods for GET, POST, PATCH, DELETE operations
 * with proper error handling and logging.
 */
@Slf4j
@Component
public class CoreApiClient {

    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public CoreApiClient(WebClient coreApiWebClient, ObjectMapper objectMapper) {
        this.webClient = coreApiWebClient;
        this.objectMapper = objectMapper;
    }

    // ==================== GET Methods ====================

    /**
     * GET request returning a typed response
     */
    public <T> T get(String endpoint, Class<T> responseType) {
        return webClient.get()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    /**
     * GET request for generic types (e.g., List<Map<String, Object>>)
     */
    public <T> T get(String endpoint, ParameterizedTypeReference<T> responseType) {
        return webClient.get()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    /**
     * GET request with query parameters
     */
    public <T> T get(String endpoint, Map<String, Object> queryParams, Class<T> responseType) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(endpoint);
                    queryParams.forEach((key, value) -> {
                        if (value != null) {
                            uriBuilder.queryParam(key, value);
                        }
                    });
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    // ==================== POST Methods ====================

    /**
     * POST request with JSON body
     */
    public <T, R> T post(String endpoint, R body, Class<T> responseType) {
        return webClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body != null ? body : Map.of())
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    /**
     * POST request without body
     */
    public <T> T post(String endpoint, Class<T> responseType) {
        return post(endpoint, Map.of(), responseType);
    }

    /**
     * POST request with multipart form data (file upload)
     */
    public <T> T postMultipart(String endpoint, MultiValueMap<String, ?> body, Class<T> responseType) {
        return webClient.post()
                .uri(endpoint)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData((MultiValueMap<String, Object>) body))
                .retrieve()
                .bodyToMono(responseType)
                .timeout(Duration.ofMinutes(5)) // Longer timeout for file uploads
                .block();
    }

    // ==================== PATCH Methods ====================

    /**
     * PATCH request with JSON body
     */
    public <T, R> T patch(String endpoint, R body, Class<T> responseType) {
        return webClient.patch()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body != null ? body : Map.of())
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    // ==================== DELETE Methods ====================

    /**
     * DELETE request
     */
    public <T> T delete(String endpoint, Class<T> responseType) {
        return webClient.delete()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    /**
     * DELETE request returning void
     */
    public void delete(String endpoint) {
        webClient.delete()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(DEFAULT_TIMEOUT)
                .block();
    }

    // ==================== Utility Methods ====================

    /**
     * Build query string from parameters
     */
    public String buildQueryString(Map<String, Object> params) {
        if (params == null || params.isEmpty()) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder("?");
        params.forEach((key, value) -> {
            if (value != null) {
                if (sb.length() > 1) {
                    sb.append("&");
                }
                sb.append(key).append("=").append(value);
            }
        });
        return sb.toString();
    }
}
