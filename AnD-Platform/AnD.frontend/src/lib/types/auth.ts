// Auth Types for atk-def-wrapper integration

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT"

/**
 * JWT Response from /api/auth/signin
 */
export interface JwtResponse {
    token: string
    type: string // "Bearer"
    id: number
    username: string
    displayName: string
    roles: string[]
    isStudent: boolean
}

/**
 * Current user info from /api/auth/me
 */
export interface User {
    id: number
    username: string
    displayName: string
    role: UserRole
    isStudent: boolean
    teamId?: string
    teamName?: string
}

/**
 * Login request body
 */
export interface LoginRequest {
    username: string
    password: string
}

/**
 * User signup request body (no team picker)
 */
export interface SignupRequest {
    username: string
    password: string
    displayName?: string
    affiliation?: string
}

/**
 * Response from /api/auth/me
 */
export interface UserInfoResponse {
    id: number
    username: string
    displayName: string
    role: string
    isStudent: boolean
    teamId?: string
    teamName?: string
}

/**
 * Team entity for team management (no credentials)
 */
export interface Team {
    id: string
    name: string
    affiliation?: string
    country?: string
    ipAddress?: string
    memberCount?: number
}

/**
 * Create team request (admin/teacher)
 */
export interface CreateTeamRequest {
    name: string
    country?: string
    affiliation?: string
    ipAddress?: string
}

/**
 * Team creation response
 */
export interface TeamCreateResponse {
    id: string
    name: string
    message: string
    username?: string
    generatedPassword?: string
}

/**
 * User entity for user management
 */
export interface UserListItem {
    id: number
    username: string
    displayName: string
    role: string
    affiliation?: string
    teamId?: string
    teamName?: string
    createdAt?: string
}

/**
 * Assign user to team request
 */
export interface AssignTeamRequest {
    teamId: string
}
