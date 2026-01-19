package com.tool.atkdefbackend.config;

import com.tool.atkdefbackend.exception.BusinessException;
import com.tool.atkdefbackend.exception.CoreApiException;
import com.tool.atkdefbackend.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Exception Handler for consistent error responses
 * 
 * Provides centralized exception handling with:
 * - Consistent JSON error format
 * - Appropriate HTTP status codes
 * - Security-aware error messages (no stack traces in production)
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors (e.g., @Valid annotation failures)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing // Keep first error for duplicate fields
                ));

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                fieldErrors
        );
    }

    /**
     * Handle illegal argument exceptions (business logic validation)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    /**
     * Handle illegal state exceptions
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        log.error("Illegal state: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                null
        );
    }

    /**
     * Handle authentication failures
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid username or password",
                null
        );
    }

    /**
     * Handle authentication exceptions
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        log.warn("Authentication error: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication required",
                null
        );
    }

    /**
     * Handle access denied (authorization failures)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "You don't have permission to access this resource",
                null
        );
    }

    /**
     * Handle Core API exceptions (Python backend errors)
     * Propagates the original status code and error message from Python Core
     */
    @ExceptionHandler(CoreApiException.class)
    public ResponseEntity<Map<String, Object>> handleCoreApiException(CoreApiException ex) {
        log.warn("Core API error [{}]: {}", ex.getStatusCode(), ex.getMessage());
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        response.put("status", ex.getStatusCode());
        response.put("timestamp", LocalDateTime.now().toString());
        
        if (ex.getErrorCode() != null) {
            response.put("errorCode", ex.getErrorCode());
        }
        if (ex.getDetails() != null) {
            response.put("details", ex.getDetails());
        }
        
        return ResponseEntity.status(status).body(response);
    }

    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                null
        );
    }

    /**
     * Handle business logic exceptions
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
        log.warn("Business error [{}]: {}", ex.getErrorCode(), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        response.put("errorCode", ex.getErrorCode());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle REST client exceptions (Python backend communication)
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, Object>> handleRestClientError(RestClientException ex) {
        log.error("Backend communication error: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Unable to communicate with game server. Please try again later.",
                null
        );
    }

    /**
     * Handle WebClient response exceptions (Core API 4xx/5xx responses)
     * Propagates the original error message from Python Core API
     */
    @ExceptionHandler(org.springframework.web.reactive.function.client.WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleWebClientResponseException(
            org.springframework.web.reactive.function.client.WebClientResponseException ex) {
        log.warn("Core API error [{}]: {}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
        
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        // Try to extract detail message from Core API response
        String errorMessage = "Backend error";
        try {
            String body = ex.getResponseBodyAsString();
            if (body != null && !body.isEmpty()) {
                // Parse JSON response from Core API
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> errorBody = mapper.readValue(body, Map.class);
                if (errorBody.containsKey("detail")) {
                    errorMessage = String.valueOf(errorBody.get("detail"));
                }
            }
        } catch (Exception e) {
            log.debug("Could not parse Core API error response: {}", e.getMessage());
            errorMessage = ex.getMessage();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", errorMessage);
        response.put("detail", errorMessage); // Also include as 'detail' for frontend compatibility
        response.put("status", status.value());
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.status(status).body(response);
    }

    /**
     * Handle RuntimeException (catch-all for unexpected errors)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Unexpected runtime error", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.",
                null
        );
    }

    /**
     * Handle all other exceptions (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                null
        );
    }

    /**
     * Build consistent error response
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String message,
            Map<String, String> details) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        response.put("status", status.value());
        response.put("timestamp", LocalDateTime.now().toString());
        
        if (details != null && !details.isEmpty()) {
            response.put("details", details);
        }

        return ResponseEntity.status(status).body(response);
    }
}
