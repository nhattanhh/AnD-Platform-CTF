package com.tool.atkdefbackend.exception;

import lombok.Getter;

/**
 * Exception thrown when the Python Core API returns an error.
 * Contains the original HTTP status and error details from the backend.
 */
@Getter
public class CoreApiException extends RuntimeException {
    
    private final int statusCode;
    private final String errorCode;
    private final Object details;

    public CoreApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = null;
        this.details = null;
    }

    public CoreApiException(String message, int statusCode, String errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = null;
    }

    public CoreApiException(String message, int statusCode, String errorCode, Object details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
    }

    public CoreApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.errorCode = null;
        this.details = null;
    }
}
