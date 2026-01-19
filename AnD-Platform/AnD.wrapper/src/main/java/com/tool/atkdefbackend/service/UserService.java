package com.tool.atkdefbackend.service;

import com.tool.atkdefbackend.dto.user.CreateUserRequest;
import com.tool.atkdefbackend.dto.user.UserResponse;
import com.tool.atkdefbackend.dto.user.UpdateUserRequest;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for user management (Admin/Teacher accounts).
 */
public interface UserService {

    /**
     * Create a new admin or teacher user.
     * @param request User creation details
     * @param role ADMIN or TEACHER
     * @return Created user response
     */
    UserResponse createUser(CreateUserRequest request, String role);

    /**
     * Get user by ID.
     */
    Optional<UserResponse> getUserById(Integer id);

    /**
     * Get user by username.
     */
    Optional<UserResponse> getUserByUsername(String username);

    /**
     * List all users (Admin/Teacher only, not teams).
     */
    List<UserResponse> listUsers();

    /**
     * Update user details.
     */
    UserResponse updateUser(Integer id, UpdateUserRequest request);

    /**
     * Delete user by ID.
     */
    void deleteUser(Integer id);

    /**
     * Reset user password.
     * @return The new generated password
     */
    String resetPassword(Integer id);

    /**
     * Check if username exists.
     */
    boolean existsByUsername(String username);
}
