package com.tool.atkdefbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Info Response - Returned from /api/auth/me
 * Works for all user types (Team, Admin, Teacher)
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamInfoResponse {
    private Integer id;
    private String username;
    private String displayName;  // Team name for teams, display name for admins
    private String role;
    private boolean isTeam;      // true if role is TEAM, false otherwise
    
    // Convenience factory methods for clarity
    public static TeamInfoResponse forTeam(Integer id, String username, String teamName, String role) {
        return new TeamInfoResponse(id, username, teamName, role, true);
    }
    
    public static TeamInfoResponse forAdmin(Integer id, String username, String displayName, String role) {
        return new TeamInfoResponse(id, username, displayName, role, false);
    }
}

