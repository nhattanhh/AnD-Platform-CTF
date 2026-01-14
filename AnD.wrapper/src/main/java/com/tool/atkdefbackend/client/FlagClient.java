package com.tool.atkdefbackend.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Client for Flag-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FlagClient {

    private final CoreApiClient coreApiClient;

    /**
     * List flags with filters.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> listFlags(UUID gameId, String teamId, UUID tickId, 
                                         Boolean isStolen, int skip, int limit) {
        StringBuilder endpoint = new StringBuilder("/flags?");
        endpoint.append(String.format("game_id=%s&skip=%d&limit=%d", gameId, skip, Math.min(limit, 100)));
        
        if (teamId != null) {
            endpoint.append("&team_id=").append(teamId);
        }
        if (tickId != null) {
            endpoint.append("&tick_id=").append(tickId);
        }
        if (isStolen != null) {
            endpoint.append("&is_stolen=").append(isStolen);
        }
        
        return coreApiClient.get(endpoint.toString(), Map.class);
    }

    /**
     * Get flag by ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFlag(UUID flagId) {
        return coreApiClient.get("/flags/" + flagId, Map.class);
    }

    /**
     * Get flag by value.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFlagByValue(String flagValue) {
        return coreApiClient.get("/flags/by-value/" + flagValue, Map.class);
    }

    /**
     * Get flag statistics.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFlagStats(UUID gameId, String teamId) {
        StringBuilder endpoint = new StringBuilder("/flags/stats?game_id=").append(gameId);
        if (teamId != null) {
            endpoint.append("&team_id=").append(teamId);
        }
        return coreApiClient.get(endpoint.toString(), Map.class);
    }

    /**
     * Get flags for a specific tick.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getTickFlags(UUID tickId, int skip, int limit) {
        return coreApiClient.get(String.format("/flags/tick/%s?skip=%d&limit=%d", tickId, skip, limit), Map.class);
    }
}
