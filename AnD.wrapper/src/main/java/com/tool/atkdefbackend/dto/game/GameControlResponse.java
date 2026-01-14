package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for game control actions (start/stop/pause).
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameControlResponse {

    private String message;
    private String status;
    private Boolean success;
    
    @JsonProperty("teams_deployed")
    private Integer teamsDeployed;
    
    private List<Map<String, Object>> teams;
}
