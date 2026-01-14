package com.tool.atkdefbackend.dto.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for user details.
 * Matches database entity format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponse {

    private Integer id;
    private String username;
    
    @JsonProperty("display_name")
    private String displayName;
    
    private String role;
    private String affiliation;
    private String country;
    
    @JsonProperty("is_active")
    private Boolean isActive;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
