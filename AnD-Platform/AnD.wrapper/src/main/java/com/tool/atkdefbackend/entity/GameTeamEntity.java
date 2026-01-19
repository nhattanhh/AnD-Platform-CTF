package com.tool.atkdefbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * GameTeam Entity - Links teams to games
 * 
 * This entity represents a team's participation in a specific game.
 * It corresponds to the Python `GameTeam` model in the core system.
 * 
 * Relationships:
 * - GameTeam → Team (many-to-one): Each game-team entry belongs to a team
 * 
 * IMPORTANT: This is a read-only view of data managed by the Python core.
 * The primary purpose is to link Java Team entities with Python game data.
 */
@Entity
@Table(name = "game_teams", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"game_id", "team_id"}),
       indexes = {
           @Index(name = "ix_game_teams_game_team", columnList = "game_id, team_id"),
           @Index(name = "ix_game_teams_token", columnList = "token")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameTeamEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "game_id", nullable = false)
    private UUID gameId;

    @Column(name = "team_id", nullable = false, length = 100)
    private String teamId;

    @Column(name = "token", unique = true, length = 64)
    private String token;

    @Column(name = "container_name", length = 200)
    private String containerName;

    @Column(name = "container_ip", length = 50)
    private String containerIp;

    @Column(name = "ssh_username", length = 50)
    private String sshUsername;

    @Column(name = "ssh_password", length = 100)
    private String sshPassword;

    @Column(name = "ssh_port")
    private Integer sshPort;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
