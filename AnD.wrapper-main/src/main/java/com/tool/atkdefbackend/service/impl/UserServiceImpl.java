package com.tool.atkdefbackend.service.impl;

import com.tool.atkdefbackend.dto.user.CreateUserRequest;
import com.tool.atkdefbackend.dto.user.UpdateUserRequest;
import com.tool.atkdefbackend.dto.user.UserResponse;
import com.tool.atkdefbackend.entity.UserEntity;
import com.tool.atkdefbackend.exception.BusinessException;
import com.tool.atkdefbackend.exception.ResourceNotFoundException;
import com.tool.atkdefbackend.repository.UserRepository;
import com.tool.atkdefbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of UserService for admin/teacher user management.
 * 
 * Now uses UserEntity instead of TeamEntity.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    private static final int PASSWORD_LENGTH = 16;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request, String role) {
        // Validate role
        if (!role.equals("ADMIN") && !role.equals("TEACHER")) {
            throw new BusinessException("Invalid role. Must be ADMIN or TEACHER", "INVALID_ROLE");
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken", "USERNAME_EXISTS");
        }

        // Generate display name if not provided
        String displayName = request.getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = role.substring(0, 1) + role.substring(1).toLowerCase() + " - " + request.getUsername();
        }

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(displayName)
                .affiliation(request.getAffiliation())
                .role(role)
                .team(null)  // Admin/Teacher don't belong to teams
                .build();

        user = userRepository.save(user);
        log.info("{} account created: {} ({})", role, displayName, user.getUsername());

        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserById(Integer id) {
        return userRepository.findByIdWithTeam(id)
                .filter(user -> !user.getRole().equals("STUDENT"))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsernameWithTeam(username)
                .filter(user -> !user.getRole().equals("STUDENT"))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getRole().equals("STUDENT"))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));

        if (user.getRole().equals("STUDENT")) {
            throw new BusinessException("Use UserController for student accounts", "INVALID_USER_TYPE");
        }

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getAffiliation() != null) {
            user.setAffiliation(request.getAffiliation());
        }

        user = userRepository.save(user);
        log.info("User updated: {} ({})", user.getDisplayName(), user.getUsername());

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));

        if (user.getRole().equals("STUDENT")) {
            throw new BusinessException("Use UserController for student accounts", "INVALID_USER_TYPE");
        }

        userRepository.delete(user);
        log.info("User deleted: {} ({})", user.getDisplayName(), user.getUsername());
    }

    @Override
    @Transactional
    public String resetPassword(Integer id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));

        String newPassword = generateSecurePassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset for user: {}", user.getUsername());
        return newPassword;
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    private String generateSecurePassword() {
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(ALLOWED_CHARS.charAt(secureRandom.nextInt(ALLOWED_CHARS.length())));
        }
        return password.toString();
    }

    private UserResponse mapToResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .affiliation(user.getAffiliation())
                .build();
    }
}
