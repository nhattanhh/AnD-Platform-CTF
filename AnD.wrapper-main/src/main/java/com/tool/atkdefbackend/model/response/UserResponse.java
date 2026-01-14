package com.tool.atkdefbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Integer id;
    private String username;
    private String role;
    private String team; // Team name if assigned
}
