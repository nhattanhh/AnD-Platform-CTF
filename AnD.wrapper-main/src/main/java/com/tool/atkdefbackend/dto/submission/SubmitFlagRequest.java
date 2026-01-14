package com.tool.atkdefbackend.dto.submission;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for flag submission.
 * Note: team_id is injected server-side for TEAM users.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitFlagRequest {

    @NotNull(message = "Game ID is required")
    @JsonProperty("game_id")
    private UUID gameId;

    @NotBlank(message = "Flag is required")
    private String flag;

    /**
     * Team ID - injected by server for TEAM users, 
     * can be specified by ADMIN/TEACHER for testing.
     */
    @JsonProperty("team_id")
    private String teamId;
}
