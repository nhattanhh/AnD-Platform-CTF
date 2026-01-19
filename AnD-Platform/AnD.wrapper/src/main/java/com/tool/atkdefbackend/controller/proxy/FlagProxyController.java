package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.FlagClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Flag Proxy Controller - Refactored with FlagClient.
 * 
 * Admin/Teacher API for viewing flags (read-only).
 */
@RestController
@RequestMapping("/api/proxy/flags")
@Tag(name = "Flag Proxy", description = "🚩 Flag Management - View and query flags")
@RequiredArgsConstructor
public class FlagProxyController {

    private final FlagClient flagClient;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List flags", description = "Get flags with optional filters")
    public ResponseEntity<?> listFlags(
            @Parameter(description = "Game UUID (required)") @RequestParam UUID gameId,
            @Parameter(description = "Team ID filter") @RequestParam(required = false) String teamId,
            @Parameter(description = "Tick UUID filter") @RequestParam(required = false) UUID tickId,
            @Parameter(description = "Stolen status filter") @RequestParam(required = false) Boolean isStolen,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "50") int limit) {
        Map<String, Object> result = flagClient.listFlags(gameId, teamId, tickId, isStolen, skip, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{flagId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get flag", description = "Get flag details by ID")
    public ResponseEntity<?> getFlag(@PathVariable UUID flagId) {
        Map<String, Object> result = flagClient.getFlag(flagId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-value/{flagValue}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get flag by value", description = "Look up a flag by its string value")
    public ResponseEntity<?> getFlagByValue(@PathVariable String flagValue) {
        Map<String, Object> result = flagClient.getFlagByValue(flagValue);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get flag stats", description = "Get flag statistics for a game")
    public ResponseEntity<?> getFlagStats(
            @Parameter(description = "Game UUID") @RequestParam UUID gameId,
            @Parameter(description = "Team ID filter") @RequestParam(required = false) String teamId) {
        Map<String, Object> result = flagClient.getFlagStats(gameId, teamId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tick/{tickId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get tick flags", description = "Get all flags for a specific tick")
    public ResponseEntity<?> getTickFlags(
            @PathVariable UUID tickId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "50") int limit) {
        Map<String, Object> result = flagClient.getTickFlags(tickId, skip, limit);
        return ResponseEntity.ok(result);
    }
}
