package com.tool.atkdefbackend.client;

import com.tool.atkdefbackend.dto.game.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Client for Game-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GameClient {

    private final CoreApiClient coreApiClient;

    // ==================== Game CRUD ====================

    public GameResponse createGame(CreateGameRequest request) {
        log.info("Creating game: {}", request.getName());
        return coreApiClient.post("/games", request, GameResponse.class);
    }

    public GameListResponse listGames(int skip, int limit) {
        String endpoint = String.format("/games?skip=%d&limit=%d", skip, limit);
        return coreApiClient.get(endpoint, GameListResponse.class);
    }

    public GameResponse getGame(UUID gameId) {
        return coreApiClient.get("/games/" + gameId, GameResponse.class);
    }

    public GameResponse updateGame(UUID gameId, UpdateGameRequest request) {
        log.info("Updating game: {}", gameId);
        return coreApiClient.patch("/games/" + gameId, request, GameResponse.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteGame(UUID gameId) {
        log.info("Deleting game: {}", gameId);
        return coreApiClient.delete("/games/" + gameId, Map.class);
    }

    // ==================== Game Control ====================

    @SuppressWarnings("unchecked")
    public Map<String, Object> startGame(UUID gameId) {
        log.info("Starting game: {}", gameId);
        return coreApiClient.post("/games/" + gameId + "/start", Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> pauseGame(UUID gameId) {
        log.info("Pausing game: {}", gameId);
        return coreApiClient.post("/games/" + gameId + "/pause", Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> stopGame(UUID gameId) {
        log.info("Stopping game: {}", gameId);
        return coreApiClient.post("/games/" + gameId + "/stop", Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> forceStopGame(UUID gameId) {
        log.info("Force stopping game: {}", gameId);
        return coreApiClient.post("/games/" + gameId + "/force-stop", Map.class);
    }

    // ==================== Game Teams ====================

    public GameTeamResponse addTeamToGame(UUID gameId, GameTeamRequest request) {
        log.info("Adding team {} to game {}", request.getTeamId(), gameId);
        return coreApiClient.post("/games/" + gameId + "/teams", request, GameTeamResponse.class);
    }

    @SuppressWarnings("unchecked")
    public List<GameTeamResponse> getGameTeams(UUID gameId) {
        return coreApiClient.get("/games/" + gameId + "/teams", 
                new ParameterizedTypeReference<List<GameTeamResponse>>() {});
    }

    public GameTeamResponse getGameTeam(UUID gameId, String teamId) {
        return coreApiClient.get("/games/" + gameId + "/teams/" + teamId, GameTeamResponse.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> updateGameTeam(UUID gameId, String gameTeamId, Map<String, Object> updates) {
        log.info("Updating game team {} in game {}: {}", gameTeamId, gameId, updates);
        return coreApiClient.patch("/games/" + gameId + "/teams/" + gameTeamId, updates, Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> removeTeamFromGame(UUID gameId, String teamId) {
        log.info("Removing team {} from game {}", teamId, gameId);
        return coreApiClient.delete("/games/" + gameId + "/teams/" + teamId, Map.class);
    }

    // ==================== Assign Vulnbox & Checker ====================

    public GameResponse assignVulnbox(UUID gameId, UUID vulnboxId) {
        log.info("Assigning vulnbox {} to game {}", vulnboxId, gameId);
        String endpoint = String.format("/games/%s/assign-vulnbox?vulnbox_id=%s", gameId, vulnboxId);
        return coreApiClient.post(endpoint, GameResponse.class);
    }

    public GameResponse assignChecker(UUID gameId, UUID checkerId) {
        log.info("Assigning checker {} to game {}", checkerId, gameId);
        String endpoint = String.format("/games/%s/assign-checker?checker_id=%s", gameId, checkerId);
        return coreApiClient.post(endpoint, GameResponse.class);
    }

    // ==================== Utility ====================

    /**
     * Find the latest (most recently created) game.
     */
    @SuppressWarnings("unchecked")
    public GameResponse getLatestGame() {
        GameListResponse response = listGames(0, 100);
        if (response == null || response.getGames() == null || response.getGames().isEmpty()) {
            return null;
        }
        
        return response.getGames().stream()
                .filter(g -> g.getCreatedAt() != null)
                .max((g1, g2) -> g1.getCreatedAt().compareTo(g2.getCreatedAt()))
                .orElse(null);
    }
}
