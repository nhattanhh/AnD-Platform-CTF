package com.tool.atkdefbackend.client;

import com.tool.atkdefbackend.dto.game.GameResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Client for Scoreboard-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreboardClient {

    private final CoreApiClient coreApiClient;
    private final GameClient gameClient;

    /**
     * Get scoreboard for a specific game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getScoreboard(UUID gameId) {
        return coreApiClient.get("/scoreboard/" + gameId, Map.class);
    }

    /**
     * Get scoreboard for the latest game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getLatestScoreboard() {
        GameResponse latestGame = gameClient.getLatestGame();
        if (latestGame == null) {
            log.warn("No active game found for scoreboard");
            return Map.of("error", "No active game", "success", false);
        }
        return getScoreboard(latestGame.getId());
    }

    /**
     * Get team score details for a specific game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getTeamScore(UUID gameId, String teamId) {
        return coreApiClient.get("/scoreboard/" + gameId + "/teams/" + teamId, Map.class);
    }
}
