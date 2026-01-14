package com.tool.atkdefbackend.config.security;

import com.tool.atkdefbackend.service.auth.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * JWT Utility for token generation and validation
 * 
 * SECURITY NOTES:
 * - JWT secret must be at least 256 bits (32 characters) for HS256
 * - Tokens include user roles for authorization
 * - Token expiration is configurable via jwt.expirationMs
 */
@Slf4j
@Component
public class JwtUtils {

    private static final int MIN_KEY_LENGTH = 32; // 256 bits for HS256

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:86400000}") // Default: 24 hours
    private long jwtExpirationMs;

    private Key signingKey;

    /**
     * Validate JWT secret key length on application startup
     */
    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.length() < MIN_KEY_LENGTH) {
            throw new IllegalStateException(
                String.format("JWT secret must be at least %d characters (256 bits) for HS256 algorithm. " +
                              "Current length: %d. Please update jwt.secret in application.properties",
                              MIN_KEY_LENGTH, 
                              jwtSecret != null ? jwtSecret.length() : 0));
        }
        // Pre-compute signing key
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        log.info("JWT Utils initialized successfully");
    }

    /**
     * Generate JWT token with user details and roles
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        String roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("displayName", userPrincipal.getDisplayName())
                .claim("userId", userPrincipal.getId())
                .claim("teamId", userPrincipal.getTeamId())
                .claim("teamName", userPrincipal.getTeamName())
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract username from JWT token
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validate JWT token
     * Returns false for any validation failure (expired, malformed, invalid signature, etc.)
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(authToken); // Use parseClaimsJws for signed tokens
            return true;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired: {}", e.getMessage()); // Debug level for expected case
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}

