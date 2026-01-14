package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.TickClient;
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
 * Tick Proxy Controller - Refactored with TickClient.
 * 
 * API for viewing tick information.
 */
@RestController
@RequestMapping("/api/proxy/ticks")
@Tag(name = "Tick Proxy", description = "⏱️ Tick Information - View game tick data")
@RequiredArgsConstructor
public class TickProxyController {

    private final TickClient tickClient;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List ticks", description = "Get all ticks for a game")
    public ResponseEntity<?> listTicks(
            @Parameter(description = "Game UUID") @RequestParam UUID gameId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit) {
        Map<String, Object> result = tickClient.listTicks(gameId, skip, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{tickId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get tick", description = "Get tick details by ID")
    public ResponseEntity<?> getTick(@PathVariable UUID tickId) {
        Map<String, Object> result = tickClient.getTick(tickId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/current")
    @Operation(summary = "Get current tick", description = "Get current tick for a game (public)")
    public ResponseEntity<?> getCurrentTick(
            @Parameter(description = "Game UUID") @RequestParam UUID gameId) {
        Map<String, Object> result = tickClient.getCurrentTick(gameId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest tick", description = "Get latest tick for the most recent game (public)")
    public ResponseEntity<?> getLatestTick() {
        Map<String, Object> result = tickClient.getLatestTick();
        return ResponseEntity.ok(result);
    }
}
