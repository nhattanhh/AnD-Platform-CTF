package com.tool.atkdefbackend.controller;

import com.tool.atkdefbackend.entity.TeamEntity;
import com.tool.atkdefbackend.entity.UserEntity;
import com.tool.atkdefbackend.repository.TeamRepository;
import com.tool.atkdefbackend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * User Management Controller
 * Admin/Teacher can manage users and assign them to teams
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "👤 User Management - Manage users and team assignments")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * List all users
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List users", description = "Get all users in the system")
    public ResponseEntity<?> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String teamId) {
        
        List<UserEntity> users;
        
        if (teamId != null) {
            users = userRepository.findByTeamIdWithTeam(teamId);
        } else if (role != null) {
            users = userRepository.findByRoleWithTeam(role);
        } else {
            users = userRepository.findAllWithTeams();
        }
        
        List<Map<String, Object>> result = users.stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get user", description = "Get user details by ID")
    public ResponseEntity<?> getUser(@PathVariable Integer id) {
        return userRepository.findByIdWithTeam(id)
                .map(user -> ResponseEntity.ok(mapUserToResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get users without a team
     */
    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get unassigned users", description = "Get users that are not assigned to any team")
    public ResponseEntity<?> getUnassignedUsers() {
        List<UserEntity> users = userRepository.findUsersWithoutTeam();
        List<Map<String, Object>> result = users.stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Create new user (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (ADMIN only)")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String password = (String) request.get("password");
        String displayName = (String) request.get("displayName");
        String role = (String) request.get("role");
        String affiliation = (String) request.get("affiliation");
        Object teamIdObj = request.get("teamId");
        
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Username is required"
            ));
        }
        
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Password is required"
            ));
        }
        
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Username already exists"
            ));
        }
        
        // Validate role
        String validRole = "STUDENT";
        if (role != null && !role.isBlank()) {
            if (role.equals("ADMIN") || role.equals("TEACHER") || role.equals("STUDENT")) {
                validRole = role;
            }
        }
        
        // Get team if provided
        TeamEntity team = null;
        if (teamIdObj != null) {
            String teamId = teamIdObj.toString();
            team = teamRepository.findById(teamId).orElse(null);
        }
        
        UserEntity user = UserEntity.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .displayName(displayName != null ? displayName : username)
                .role(validRole)
                .affiliation(affiliation)
                .team(team)
                .build();
        
        userRepository.save(user);
        
        log.info("User {} created with role {}", username, validRole);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User created successfully",
            "user", mapUserToResponse(user)
        ));
    }

    /**
     * Assign user to a team
     */
    @PostMapping("/{userId}/assign-team")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Assign user to team", description = "Assign a user to a team")
    public ResponseEntity<?> assignUserToTeam(
            @Parameter(description = "User ID") @PathVariable Integer userId,
            @Parameter(description = "Team ID") @RequestParam String teamId) {
        
        UserEntity user = userRepository.findById(userId)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User not found"
            ));
        }
        
        TeamEntity team = teamRepository.findById(teamId)
                .orElse(null);
        
        if (team == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Team not found"
            ));
        }
        
        user.setTeam(team);
        userRepository.save(user);
        
        log.info("User {} assigned to team {}", user.getUsername(), team.getName());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User assigned to team successfully",
            "userId", userId,
            "teamId", teamId,
            "teamName", team.getName()
        ));
    }

    /**
     * Remove user from team
     */
    @DeleteMapping("/{userId}/remove-team")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Remove user from team", description = "Remove a user from their assigned team")
    public ResponseEntity<?> removeUserFromTeam(@PathVariable Integer userId) {
        // Use findByIdWithTeam to eagerly load the team relationship
        UserEntity user = userRepository.findByIdWithTeam(userId)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User not found"
            ));
        }
        
        String previousTeam = user.getTeamName();
        user.setTeam(null);
        userRepository.save(user);
        
        log.info("User {} removed from team {}", user.getUsername(), previousTeam);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User removed from team",
            "userId", userId,
            "previousTeam", previousTeam != null ? previousTeam : "none"
        ));
    }

    /**
     * Update user (including team assignment)
     */
    @PatchMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update user", description = "Update user details including team assignment")
    public ResponseEntity<?> updateUser(
            @PathVariable Integer userId,
            @RequestBody Map<String, Object> updates) {
        
        UserEntity user = userRepository.findById(userId)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User not found"
            ));
        }
        
        // Update display name
        if (updates.containsKey("displayName")) {
            user.setDisplayName((String) updates.get("displayName"));
        }
        
        // Update affiliation
        if (updates.containsKey("affiliation")) {
            user.setAffiliation((String) updates.get("affiliation"));
        }
        
        // Update role (ADMIN only can change roles)
        if (updates.containsKey("role")) {
            String newRole = (String) updates.get("role");
            if (newRole != null && (newRole.equals("ADMIN") || newRole.equals("TEACHER") || newRole.equals("STUDENT"))) {
                user.setRole(newRole);
            }
        }
        
        // Update team assignment
        if (updates.containsKey("teamId")) {
            Object teamIdObj = updates.get("teamId");
            if (teamIdObj == null) {
                user.setTeam(null);
            } else {
                String teamId = teamIdObj.toString();
                TeamEntity team = teamRepository.findById(teamId).orElse(null);
                if (team == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Team not found"
                    ));
                }
                user.setTeam(team);
            }
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(mapUserToResponse(user));
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user (ADMIN only)")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "User not found"
            ));
        }
        
        // Prevent deleting yourself
        // Note: Could add check for authenticated user ID here
        
        String username = user.getUsername();
        userRepository.delete(user);
        
        log.info("User {} deleted", username);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User deleted successfully",
            "deletedUserId", userId
        ));
    }

    private Map<String, Object> mapUserToResponse(UserEntity user) {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        response.put("role", user.getRole());
        response.put("affiliation", user.getAffiliation() != null ? user.getAffiliation() : "");
        response.put("teamId", user.getTeamId());
        response.put("teamName", user.getTeamName() != null ? user.getTeamName() : "");
        response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return response;
    }
}
