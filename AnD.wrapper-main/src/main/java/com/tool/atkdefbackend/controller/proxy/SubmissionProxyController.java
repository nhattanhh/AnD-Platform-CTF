package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.SubmissionClient;
import com.tool.atkdefbackend.dto.submission.SubmitFlagRequest;
import com.tool.atkdefbackend.service.auth.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Submission Proxy Controller - Refactored with SubmissionClient.
 * 
 * CRITICAL GAMEPLAY API - Teams submit captured flags here.
 * SECURITY: Team ID is ALWAYS enforced from authentication to prevent spoofing.
 */
@Slf4j
@RestController
@RequestMapping("/api/proxy/submissions")
@Tag(name = "Submission Proxy", description = "🚩 Flag Submission - CORE GAMEPLAY API for capturing flags")
@RequiredArgsConstructor
public class SubmissionProxyController {

    private final SubmissionClient submissionClient;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TEAM', 'STUDENT')")
    @Operation(summary = "Submit a captured flag", description = "Submit flag - team_id is automatically set from authentication for TEAM/STUDENT users")
    public ResponseEntity<?> submitFlag(
            @Valid @RequestBody SubmitFlagRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // SECURITY: Force team_id from authentication for TEAM/STUDENT users
        boolean isTeamUser = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEAM") || a.getAuthority().equals("ROLE_STUDENT"));
        
        if (isTeamUser) {
            // Use teamId (the actual ID), not teamName
            String authenticatedTeamId = userDetails.getTeamId();
            
            if (authenticatedTeamId == null) {
                log.warn("User {} has no team assigned", userDetails.getUsername());
                return ResponseEntity.status(403).body(Map.of(
                    "error", "You are not assigned to any team",
                    "success", false
                ));
            }
            
            // Check if user is trying to submit with different team_id
            if (request.getTeamId() != null && !authenticatedTeamId.equals(request.getTeamId())) {
                log.warn("SECURITY: User {} attempted to submit flag as different team: {}", 
                         userDetails.getUsername(), request.getTeamId());
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Cannot submit flags for other teams",
                    "success", false
                ));
            }
            
            // Always use authenticated team ID
            request.setTeamId(authenticatedTeamId);
            log.info("Flag submission by team: {} (user: {})", authenticatedTeamId, userDetails.getUsername());
        } else {
            log.info("Flag submission by {}: {} for team: {}", 
                     userDetails.getAuthorities(), userDetails.getUsername(), request.getTeamId());
        }

        Map<String, Object> result = submissionClient.submitFlag(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TEAM', 'STUDENT')")
    @Operation(summary = "List flag submissions", description = "TEAM/STUDENT users only see their own submissions")
    public ResponseEntity<?> listSubmissions(
            @Parameter(description = "Game UUID") @RequestParam(required = false) UUID gameId,
            @Parameter(description = "Team ID filter") @RequestParam(required = false) String teamId,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // SECURITY: TEAM/STUDENT users can only see their own submissions
        boolean isTeamUser = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEAM") || a.getAuthority().equals("ROLE_STUDENT"));
        
        String effectiveTeamId;
        
        if (isTeamUser) {
            // CRITICAL SECURITY: Force team filtering for TEAM/STUDENT users
            effectiveTeamId = userDetails.getTeamId();
            
            if (effectiveTeamId == null || effectiveTeamId.isBlank()) {
                // User has no team - return empty results, not all submissions!
                log.warn("SECURITY: User {} (STUDENT/TEAM) has no team - returning empty submissions", 
                         userDetails.getUsername());
                return ResponseEntity.ok(Map.of(
                    "items", java.util.Collections.emptyList(),
                    "total", 0,
                    "skip", skip,
                    "limit", limit,
                    "has_more", false
                ));
            }
            
            log.debug("Filtering submissions for team: {} (user: {})", effectiveTeamId, userDetails.getUsername());
        } else {
            // ADMIN/TEACHER can optionally filter by team
            effectiveTeamId = teamId;
        }
        
        Map<String, Object> result = submissionClient.listSubmissions(gameId, effectiveTeamId, status, skip, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{submissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TEAM', 'STUDENT')")
    @Operation(summary = "Get submission details", description = "TEAM/STUDENT users can only view their own submissions")
    public ResponseEntity<?> getSubmission(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Map<String, Object> result = submissionClient.getSubmission(submissionId);
        
        // SECURITY: Verify ownership for TEAM/STUDENT users
        boolean isTeamUser = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEAM") || a.getAuthority().equals("ROLE_STUDENT"));
                
        if (isTeamUser && result != null) {
            Object submissionTeamId = result.get("attacker_team_id");
            if (submissionTeamId != null && !userDetails.getTeamId().equals(submissionTeamId.toString())) {
                log.warn("SECURITY: User {} attempted to view submission {} belonging to team {}", 
                         userDetails.getUsername(), submissionId, submissionTeamId);
                return ResponseEntity.status(403).body(Map.of(
                    "error", "You can only view your own submissions",
                    "success", false
                ));
            }
        }
        
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{submissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete submission", description = "Admin only - delete a flag submission")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Submission deletion requested by admin: {} for submission: {}", 
                 userDetails.getUsername(), submissionId);
        Map<String, Object> result = submissionClient.deleteSubmission(submissionId);
        return ResponseEntity.ok(result);
    }
}
