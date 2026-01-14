package com.tool.atkdefbackend.controller;

import com.tool.atkdefbackend.client.GameClient;
import com.tool.atkdefbackend.dto.game.GameResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Legacy Game Controller - Simplified shortcuts for game control.
 * 
 * Note: For full game management, use /api/proxy/games endpoints.
 * This controller is kept for backward compatibility.
 */
@RestController
@RequestMapping("/api/game")
@Tag(name = "Game Shortcuts", description = "🎮 Quick game control - Start/Stop latest game")
@RequiredArgsConstructor
public class GameController {

    private final GameClient gameClient;

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Start latest game", description = "Start the most recently created game")
    public ResponseEntity<?> startGame() {
        GameResponse latestGame = gameClient.getLatestGame();
        if (latestGame == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No game found to start",
                "success", false
            ));
        }
        Map<String, Object> result = gameClient.startGame(latestGame.getId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/stop")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Stop latest game", description = "Stop the most recently created game")
    public ResponseEntity<?> stopGame() {
        GameResponse latestGame = gameClient.getLatestGame();
        if (latestGame == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No game found to stop",
                "success", false
            ));
        }
        Map<String, Object> result = gameClient.stopGame(latestGame.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get latest game status", description = "Get status of the most recently created game")
    public ResponseEntity<?> getGameStatus() {
        GameResponse result = gameClient.getLatestGame();
        if (result == null) {
            return ResponseEntity.ok(Map.of(
                "status", "NO_GAME",
                "message", "No game found"
            ));
        }
        return ResponseEntity.ok(result);
    }
}
