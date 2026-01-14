package com.tool.atkdefbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for /api/auth/me endpoint
 * Contains user info including optional team membership
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfoResponse {
    private Integer id;
    private String username;
    private String displayName;
    private String role;
    private boolean isStudent;
    private String teamId;
    private String teamName;
}
