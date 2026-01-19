package com.tool.atkdefbackend.entity;

import com.tool.atkdefbackend.enums.GameStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Game Entity - Represents a game/competition
 * 
 * This is a read-only view of game data managed by the Python core.
 * Used for read operations and validation.
 */
@Entity
@Table(name = "games",
       uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameEntity {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "vulnbox_id")
    private UUID vulnboxId;

    @Column(name = "checker_id")
    private UUID checkerId;

    @Column(name = "vulnbox_path", length = 500)
    private String vulnboxPath;

    @Column(name = "checker_module", length = 200)
    private String checkerModule;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private GameStatus status = GameStatus.DRAFT;

    @Column(name = "tick_duration_seconds")
    @Builder.Default
    private Integer tickDurationSeconds = 60;

    @Column(name = "max_ticks")
    private Integer maxTicks;

    @Column(name = "current_tick")
    @Builder.Default
    private Integer currentTick = 0;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
