package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a team to a game.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameTeamRequest {

    @NotBlank(message = "Team ID is required")
    @JsonProperty("team_id")
    private String teamId;
}
