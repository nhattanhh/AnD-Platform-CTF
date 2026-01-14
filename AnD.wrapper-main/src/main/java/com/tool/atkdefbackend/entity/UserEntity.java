package com.tool.atkdefbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * User Entity - Login accounts for the system
 * 
 * Users can optionally belong to a team. Team membership is assigned by Admin/Teacher.
 * 
 * Roles:
 * - ADMIN: Full system access
 * - TEACHER: Can manage games, teams, assign users
 * - STUDENT: Regular user, can be assigned to a team
 */
@Entity
@Table(name = "users", 
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_users_username", columnNames = "username")
       },
       indexes = {
           @Index(name = "ix_users_role", columnList = "role"),
           @Index(name = "ix_users_team", columnList = "team_id"),
           @Index(name = "ix_users_created", columnList = "created_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    // --- LOGIN CREDENTIALS ---
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must be alphanumeric with underscores")
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Column(name = "password", nullable = false)
    private String password; // BCrypt hashed

    @NotBlank
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private String role = "STUDENT"; // ADMIN, TEACHER, or STUDENT

    // --- USER INFO ---
    
    @Size(max = 100)
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Size(max = 200)
    @Column(name = "affiliation", length = 200)
    private String affiliation;

    // --- TEAM RELATIONSHIP ---
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", foreignKey = @ForeignKey(name = "fk_users_team"))
    private TeamEntity team;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- HELPER METHODS ---
    
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isTeacher() {
        return "TEACHER".equals(role);
    }

    public boolean isStudent() {
        return "STUDENT".equals(role);
    }

    public boolean hasTeam() {
        return team != null;
    }

    public String getTeamId() {
        return team != null ? team.getId() : null;
    }

    public String getTeamName() {
        return team != null ? team.getName() : null;
    }
}
