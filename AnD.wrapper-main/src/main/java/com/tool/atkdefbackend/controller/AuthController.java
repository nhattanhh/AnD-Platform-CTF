package com.tool.atkdefbackend.controller;

import com.tool.atkdefbackend.model.request.UserSignUpRequest;
import com.tool.atkdefbackend.model.response.UserInfoResponse;
import com.tool.atkdefbackend.service.auth.AuthService;
import com.tool.atkdefbackend.service.auth.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller
 * Handles login, user registration, and admin/teacher registration
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "🔐 Authentication - Login, Register, Admin/Teacher Management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login for all user types (ADMIN, TEACHER, STUDENT)
     */
    @PostMapping("/signin")
    @Operation(summary = "Login", description = "Login with username and password. Works for all user types.")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody com.tool.atkdefbackend.model.request.LoginRequest loginRequest) {
        return authService.signIn(loginRequest);
    }

    /**
     * Register new user (student account)
     * No team picker - users start without a team
     */
    @PostMapping("/signup")
    @Operation(summary = "Register User", description = "Register a new user account. Users start without a team.")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserSignUpRequest signUpRequest) {
        return authService.signUp(signUpRequest);
    }

    /**
     * Register new admin (requires existing admin)
     */
    @PostMapping("/admin/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register Admin", description = "Create new admin account. Requires existing admin privileges.")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody UserSignUpRequest request) {
        return authService.createAdminUser(request, "ADMIN");
    }

    /**
     * Register new teacher (requires admin)
     */
    @PostMapping("/teacher/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register Teacher", description = "Create new teacher account. Requires admin privileges.")
    public ResponseEntity<?> registerTeacher(@Valid @RequestBody UserSignUpRequest request) {
        return authService.createAdminUser(request, "TEACHER");
    }

    /**
     * Get current logged-in user info
     * Includes team info if assigned
     */
    @GetMapping("/me")
    @Operation(summary = "Get Current User", description = "Get information about the currently logged-in user.")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "Not authenticated"
            ));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetailsImpl userDetails) {
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .orElse("UNKNOWN");

            boolean isStudent = role.equals("STUDENT");
            
            UserInfoResponse response = UserInfoResponse.builder()
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .displayName(userDetails.getDisplayName())
                    .role(role)
                    .isStudent(isStudent)
                    .teamId(userDetails.getTeamId())
                    .teamName(userDetails.getTeamName())
                    .build();
                    
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of(
            "success", false,
            "error", "Invalid session"
        ));
    }
}
