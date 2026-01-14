package com.tool.atkdefbackend.exception;

import lombok.Getter;

/**
 * Exception for resource not found errors (404).
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceType;
    private final String resourceId;

    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s not found with id: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = null;
        this.resourceId = null;
    }
}
