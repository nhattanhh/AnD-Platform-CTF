package com.tool.atkdefbackend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Signup Request - For Admin/Teacher registration
 * 
 * Unlike TeamSignUpRequest, this does NOT require a team name.
 * Used for creating administrative users who manage games.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSignUpRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Size(max = 100, message = "Display name must be at most 100 characters")
    private String displayName; // Optional, defaults to username if not provided

    @Size(max = 200)
    private String affiliation;
}
