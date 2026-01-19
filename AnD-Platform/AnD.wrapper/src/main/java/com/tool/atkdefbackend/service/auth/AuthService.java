package com.tool.atkdefbackend.service.auth;

import com.tool.atkdefbackend.entity.UserEntity;
import com.tool.atkdefbackend.model.request.LoginRequest;
import com.tool.atkdefbackend.model.request.UserSignUpRequest;
import com.tool.atkdefbackend.model.response.JwtResponse;
import com.tool.atkdefbackend.repository.UserRepository;
import com.tool.atkdefbackend.config.security.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Authentication Service
 * Handles login, user registration, and admin/teacher creation
 * 
 * Users are now separate from Teams. Each user can optionally belong to a team.
 */
@Slf4j
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
            PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Login - Returns JWT token for all user types
     */
    public ResponseEntity<?> signIn(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        boolean isStudent = roles.contains("ROLE_STUDENT");
        
        log.info("User logged in: {} (role: {})", userDetails.getUsername(), roles);

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getDisplayName(),
                roles,
                isStudent));
    }

    /**
     * Register new user (student) account
     * Users start without a team - admin/teacher can assign them later
     */
    public ResponseEntity<?> signUp(UserSignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Username is already taken"
            ));
        }

        // Generate display name if not provided
        String displayName = signUpRequest.getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = signUpRequest.getUsername();
        }

        UserEntity user = UserEntity.builder()
                .username(signUpRequest.getUsername())
                .password(encoder.encode(signUpRequest.getPassword()))
                .displayName(displayName)
                .affiliation(signUpRequest.getAffiliation())
                .role("STUDENT")  // Default role for signup
                .team(null)       // No team assigned on signup
                .build();

        userRepository.save(user);
        log.info("User registered: {} ({})", displayName, user.getUsername());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Account registered successfully",
            "username", user.getUsername(),
            "displayName", displayName
        ));
    }

    /**
     * Register admin/teacher account
     * For game organizers - requires existing admin privileges
     * 
     * @param request User signup details
     * @param role Either "ADMIN" or "TEACHER"
     */
    public ResponseEntity<?> createAdminUser(UserSignUpRequest request, String role) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Username is already taken"
            ));
        }

        // Validate role
        if (!role.equals("ADMIN") && !role.equals("TEACHER")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Invalid role. Must be ADMIN or TEACHER"
            ));
        }

        // Generate display name if not provided
        String displayName = request.getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = role.substring(0, 1) + role.substring(1).toLowerCase() + " - " + request.getUsername();
        }

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .password(encoder.encode(request.getPassword()))
                .displayName(displayName)
                .affiliation(request.getAffiliation())
                .role(role)
                .team(null)  // Admin/Teacher don't belong to teams
                .build();

        userRepository.save(user);
        log.info("{} account created: {} ({})", role, displayName, user.getUsername());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", role + " account created successfully",
            "username", user.getUsername(),
            "displayName", displayName,
            "role", role
        ));
    }
}
