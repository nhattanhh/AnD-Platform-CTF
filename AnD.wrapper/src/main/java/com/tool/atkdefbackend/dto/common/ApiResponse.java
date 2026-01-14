package com.tool.atkdefbackend.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API response wrapper for consistent response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private String error;
    private String errorCode;
    private Integer status;
    
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String error, int status) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(status)
                .build();
    }

    public static <T> ApiResponse<T> error(String error, String errorCode, int status) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .errorCode(errorCode)
                .status(status)
                .build();
    }
}
