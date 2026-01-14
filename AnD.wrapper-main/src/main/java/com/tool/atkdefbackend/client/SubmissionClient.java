package com.tool.atkdefbackend.client;

import com.tool.atkdefbackend.dto.submission.SubmissionListResponse;
import com.tool.atkdefbackend.dto.submission.SubmissionResponse;
import com.tool.atkdefbackend.dto.submission.SubmitFlagRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Client for Submission-related API calls to Python Core.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionClient {

    private final CoreApiClient coreApiClient;

    /**
     * Submit a flag (core gameplay action).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> submitFlag(SubmitFlagRequest request) {
        log.info("Submitting flag for team: {} in game: {}", request.getTeamId(), request.getGameId());
        return coreApiClient.post("/submissions", request, Map.class);
    }

    /**
     * List submissions with filters.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> listSubmissions(UUID gameId, String teamId, String status, int skip, int limit) {
        StringBuilder endpoint = new StringBuilder("/submissions?");
        endpoint.append(String.format("skip=%d&limit=%d", skip, Math.min(limit, 100)));
        
        if (gameId != null) {
            endpoint.append("&game_id=").append(gameId);
        }
        if (teamId != null) {
            endpoint.append("&team_id=").append(teamId);
        }
        if (status != null) {
            endpoint.append("&status=").append(status);
        }
        
        return coreApiClient.get(endpoint.toString(), Map.class);
    }

    /**
     * Get submission by ID.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getSubmission(UUID submissionId) {
        return coreApiClient.get("/submissions/" + submissionId, Map.class);
    }

    /**
     * Delete submission (admin only).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteSubmission(UUID submissionId) {
        log.info("Deleting submission: {}", submissionId);
        return coreApiClient.delete("/submissions/" + submissionId, Map.class);
    }
}
