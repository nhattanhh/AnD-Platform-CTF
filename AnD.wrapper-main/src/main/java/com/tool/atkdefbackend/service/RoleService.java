package com.tool.atkdefbackend.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Service for role and permission management.
 */
@Service
public class RoleService {

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_TEACHER = "TEACHER";
    public static final String ROLE_TEAM = "TEAM";

    private static final List<String> ADMIN_ROLES = Arrays.asList(ROLE_ADMIN);
    private static final List<String> STAFF_ROLES = Arrays.asList(ROLE_ADMIN, ROLE_TEACHER);
    private static final List<String> ALL_ROLES = Arrays.asList(ROLE_ADMIN, ROLE_TEACHER, ROLE_TEAM);

    /**
     * Check if a role is valid.
     */
    public boolean isValidRole(String role) {
        return ALL_ROLES.contains(role);
    }

    /**
     * Check if a role has admin privileges.
     */
    public boolean isAdmin(String role) {
        return ADMIN_ROLES.contains(role);
    }

    /**
     * Check if a role has staff privileges (admin or teacher).
     */
    public boolean isStaff(String role) {
        return STAFF_ROLES.contains(role);
    }

    /**
     * Check if a role is a team role.
     */
    public boolean isTeam(String role) {
        return ROLE_TEAM.equals(role);
    }

    /**
     * Get the hierarchy level of a role (higher = more privileges).
     */
    public int getRoleHierarchy(String role) {
        return switch (role) {
            case ROLE_ADMIN -> 100;
            case ROLE_TEACHER -> 50;
            case ROLE_TEAM -> 10;
            default -> 0;
        };
    }

    /**
     * Check if sourceRole can manage targetRole.
     */
    public boolean canManageRole(String sourceRole, String targetRole) {
        // Admin can manage everyone except other admins
        if (ROLE_ADMIN.equals(sourceRole)) {
            return true;
        }
        // Teacher can only manage teams
        if (ROLE_TEACHER.equals(sourceRole)) {
            return ROLE_TEAM.equals(targetRole);
        }
        return false;
    }

    /**
     * Get list of roles that a given role can create.
     */
    public List<String> getCreatableRoles(String role) {
        if (ROLE_ADMIN.equals(role)) {
            return STAFF_ROLES; // Admin can create Admin and Teacher
        }
        return List.of(); // Others cannot create users
    }
}
