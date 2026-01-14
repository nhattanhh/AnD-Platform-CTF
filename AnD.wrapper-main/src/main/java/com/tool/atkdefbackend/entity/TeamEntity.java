package com.tool.atkdefbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Team Entity - Pure team information (no credentials)
 * 
 * Teams are game participants. Multiple users can belong to one team.
 * Users are assigned to teams by Admin/Teacher.
 * 
 * Game participation is tracked via the GameTeam table (managed by Python core).
 */
@Entity
@Table(name = "teams", 
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_teams_name", columnNames = "name")
       },
       indexes = {
           @Index(name = "ix_teams_created", columnList = "created_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamEntity {

    @Id
    @Column(name = "id", length = 8)
    private String id;

    // Generate random 8-char alphanumeric ID before persisting
    @PrePersist
    public void generateId() {
        if (this.id == null) {
            String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            StringBuilder sb = new StringBuilder(8);
            java.security.SecureRandom random = new java.security.SecureRandom();
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            this.id = sb.toString();
        }
    }

    // --- TEAM INFO ---
    
    @NotBlank(message = "Team name is required")
    @Size(min = 2, max = 100, message = "Team name must be 2-100 characters")
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Size(max = 200)
    @Column(name = "affiliation", length = 200)
    private String affiliation;

    @Size(max = 50)
    @Column(name = "country", length = 50)
    private String country;

    @Size(max = 50)
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- TEAM MEMBERS ---
    
    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserEntity> members = new ArrayList<>();

    // --- HELPER METHODS ---
    
    public int getMemberCount() {
        return members != null ? members.size() : 0;
    }
}