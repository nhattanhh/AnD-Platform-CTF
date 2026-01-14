package com.tool.atkdefbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * JWT Response - Returned after successful authentication
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    
    @Builder.Default
    private String type = "Bearer";
    
    private Integer id;
    private String username;
    private String displayName;  // Team name for teams, display name for admins
    private List<String> roles;
    private boolean isTeam;      // true for TEAM role, false for ADMIN/TEACHER

    // Convenience constructor for backward compatibility
    public JwtResponse(String token, Integer id, String username, String displayName, 
                       List<String> roles, boolean isTeam) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.roles = roles;
        this.isTeam = isTeam;
    }
}

