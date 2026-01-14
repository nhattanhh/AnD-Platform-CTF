package com.tool.atkdefbackend.controller;

import com.tool.atkdefbackend.client.ScoreboardClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Legacy Scoreboard Controller - Public scoreboard endpoint.
 * 
 * Note: For more options, use /api/proxy/scoreboard endpoints.
 * This controller is kept for backward compatibility.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Scoreboard", description = "📊 Public scoreboard")
@RequiredArgsConstructor
public class ScoreboardController {

    private final ScoreboardClient scoreboardClient;

    @GetMapping("/scoreboard")
    @Operation(summary = "Get scoreboard", description = "Get scoreboard for the latest game (public)")
    public ResponseEntity<?> getScoreboard() {
        Map<String, Object> result = scoreboardClient.getLatestScoreboard();
        return ResponseEntity.ok(result);
    }
}
