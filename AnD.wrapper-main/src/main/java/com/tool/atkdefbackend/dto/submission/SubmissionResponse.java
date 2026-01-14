package com.tool.atkdefbackend.dto.submission;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for submission details.
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubmissionResponse {

    private UUID id;

    @JsonProperty("game_id")
    private UUID gameId;

    @JsonProperty("attacker_team_id")
    private String attackerTeamId;

    @JsonProperty("defender_team_id")
    private String defenderTeamId;

    @JsonProperty("flag_id")
    private UUID flagId;

    @JsonProperty("submitted_flag")
    private String submittedFlag;

    @JsonProperty("flag_value")
    private String flagValue;

    private String status;

    private Integer points;

    private String message;

    @JsonProperty("submitted_at")
    private LocalDateTime submittedAt;
}
