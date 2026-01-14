package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for game team details.
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameTeamResponse {

    private UUID id;
    
    @JsonProperty("game_id")
    private UUID gameId;
    
    @JsonProperty("team_id")
    private String teamId;
    
    // Team name - enriched from wrapper's database
    @JsonProperty("team_name")
    private String teamName;
    
    @JsonProperty("container_name")
    private String containerName;
    
    @JsonProperty("container_ip")
    private String containerIp;
    
    @JsonProperty("ssh_username")
    private String sshUsername;
    
    @JsonProperty("ssh_password")
    private String sshPassword;
    
    @JsonProperty("ssh_port")
    private Integer sshPort;
    
    @JsonProperty("is_active")
    private Boolean isActive;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    // Additional fields for scoring (may be populated in some endpoints)
    private Integer score;
    
    @JsonProperty("attack_points")
    private Integer attackPoints;
    
    @JsonProperty("defense_points")
    private Integer defensePoints;
    
    @JsonProperty("sla_points")
    private Double slaPoints;
    
    private String token;
}
