package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a game (partial update).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGameRequest {

    private String name;

    @Min(value = 10, message = "Tick duration must be at least 10 seconds")
    @JsonProperty("tick_duration")
    private Integer tickDuration;

    @Min(value = 60, message = "Flag lifetime must be at least 60 seconds")
    @JsonProperty("flag_lifetime")
    private Integer flagLifetime;

    @Min(value = 1, message = "Max ticks must be at least 1")
    @JsonProperty("max_ticks")
    private Integer maxTicks;

    private String description;
}
