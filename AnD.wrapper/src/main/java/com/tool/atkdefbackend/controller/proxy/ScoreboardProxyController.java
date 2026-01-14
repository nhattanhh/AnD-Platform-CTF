package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.GameClient;
import com.tool.atkdefbackend.client.ScoreboardClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Scoreboard Proxy Controller - Refactored with ScoreboardClient.
 * 
 * Public API for viewing game scores.
 */
@RestController
@RequestMapping("/api/proxy/scoreboard")
@Tag(name = "Scoreboard Proxy", description = "📊 Scoreboard - View game scores and team rankings")
@RequiredArgsConstructor
public class ScoreboardProxyController {

    private final ScoreboardClient scoreboardClient;
    private final GameClient gameClient;

    @GetMapping
    @Operation(summary = "Get all games with scores", description = "Get a list of all games for viewing scoreboards")
    public ResponseEntity<?> listGamesForScoreboard(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit) {
        // Return all games so students can navigate to their scoreboards
        return ResponseEntity.ok(gameClient.listGames(skip, limit));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest scoreboard", description = "Get scoreboard for the most recent game")
    public ResponseEntity<?> getLatestScoreboard() {
        Map<String, Object> result = scoreboardClient.getLatestScoreboard();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{gameId}")
    @Operation(summary = "Get game scoreboard", description = "Get scoreboard for a specific game")
    public ResponseEntity<?> getScoreboard(
            @Parameter(description = "Game UUID") @PathVariable UUID gameId) {
        Map<String, Object> result = scoreboardClient.getScoreboard(gameId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{gameId}/teams/{teamId}")
    @Operation(summary = "Get team score", description = "Get score details for a specific team in a game")
    public ResponseEntity<?> getTeamScore(
            @PathVariable UUID gameId,
            @PathVariable String teamId) {
        Map<String, Object> result = scoreboardClient.getTeamScore(gameId, teamId);
        return ResponseEntity.ok(result);
    }
}
