package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for game details.
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameResponse {

    private UUID id;
    private String name;
    private String status;
    private String description;
    
    @JsonProperty("tick_duration_seconds")
    private Integer tickDurationSeconds;
    
    @JsonProperty("flag_lifetime")
    private Integer flagLifetime;
    
    @JsonProperty("max_ticks")
    private Integer maxTicks;
    
    @JsonProperty("current_tick")
    private Integer currentTick;
    
    @JsonProperty("vulnbox_path")
    private String vulnboxPath;
    
    @JsonProperty("checker_module")
    private String checkerModule;
    
    @JsonProperty("vulnbox_id")
    private UUID vulnboxId;
    
    @JsonProperty("checker_id")
    private UUID checkerId;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("start_time")
    private LocalDateTime startTime;
    
    @JsonProperty("end_time")
    private LocalDateTime endTime;
}
