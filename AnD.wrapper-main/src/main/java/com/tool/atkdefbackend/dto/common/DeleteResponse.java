package com.tool.atkdefbackend.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response for delete operations.
 * Compatible with Python Core API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeleteResponse {
    
    // Core API may return various field names
    @JsonProperty("deleted_id")
    private UUID deletedId;
    
    private UUID id;
    private String message;
    private Boolean success;
    private Boolean deleted;

    public static DeleteResponse of(UUID id) {
        return DeleteResponse.builder()
                .deletedId(id)
                .id(id)
                .success(true)
                .deleted(true)
                .message("Deleted successfully")
                .build();
    }

    public static DeleteResponse of(UUID id, String message) {
        return DeleteResponse.builder()
                .deletedId(id)
                .id(id)
                .success(true)
                .deleted(true)
                .message(message)
                .build();
    }
}
