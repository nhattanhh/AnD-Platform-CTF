package com.tool.atkdefbackend.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Client for Tick-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TickClient {

    private final CoreApiClient coreApiClient;

    /**
     * List ticks for a game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> listTicks(UUID gameId, int skip, int limit) {
        return coreApiClient.get(String.format("/ticks?game_id=%s&skip=%d&limit=%d", gameId, skip, limit), Map.class);
    }

    /**
     * Get tick by ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getTick(UUID tickId) {
        return coreApiClient.get("/ticks/" + tickId, Map.class);
    }

    /**
     * Get current tick for a game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCurrentTick(UUID gameId) {
        return coreApiClient.get("/ticks/current?game_id=" + gameId, Map.class);
    }

    /**
     * Get latest tick for the most recent game.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getLatestTick() {
        return coreApiClient.get("/ticks/latest", Map.class);
    }
}
