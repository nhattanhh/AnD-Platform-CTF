package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.GameClient;
import com.tool.atkdefbackend.dto.game.*;
import com.tool.atkdefbackend.entity.TeamEntity;
import com.tool.atkdefbackend.repository.TeamRepository;
import com.tool.atkdefbackend.service.auth.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Game Proxy Controller - Refactored with typed DTOs and GameClient.
 * 
 * Full CRUD for Games + Game Teams + Game Control.
 */
@RestController
@RequestMapping("/api/proxy/games")
@Tag(name = "Game Proxy", description = "🎮 Game Management - Create, Control, Manage Games & Teams")
@RequiredArgsConstructor
public class GameProxyController {

    private final GameClient gameClient;
    private final TeamRepository teamRepository;

    // ======================== GAME CRUD ========================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Create a new game", description = "Create a new CTF game. Requires ADMIN role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Game created successfully",
                content = @Content(schema = @Schema(implementation = GameResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<GameResponse> createGame(@Valid @RequestBody CreateGameRequest request) {
        return ResponseEntity.ok(gameClient.createGame(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "List all games", description = "Get paginated list of all games.")
    public ResponseEntity<GameListResponse> listGames(
            @Parameter(description = "Number of items to skip") @RequestParam(defaultValue = "0") int skip,
            @Parameter(description = "Maximum items to return") @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(gameClient.listGames(skip, limit));
    }

    @GetMapping("/{gameId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get game details", description = "Get details of a specific game.")
    public ResponseEntity<GameResponse> getGame(@Parameter(description = "Game UUID") @PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.getGame(gameId));
    }

    @PatchMapping("/{gameId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update game", description = "Update game details. Requires ADMIN role.")
    public ResponseEntity<GameResponse> updateGame(
            @PathVariable UUID gameId,
            @Valid @RequestBody UpdateGameRequest request) {
        return ResponseEntity.ok(gameClient.updateGame(gameId, request));
    }

    @DeleteMapping("/{gameId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete game", description = "Delete a game. Requires ADMIN role.")
    public ResponseEntity<?> deleteGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.deleteGame(gameId));
    }

    // ======================== GAME CONTROL ========================

    @PostMapping("/{gameId}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Start game", description = "Start a draft/paused game. Deploys containers for all teams.")
    public ResponseEntity<?> startGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.startGame(gameId));
    }

    @PostMapping("/{gameId}/pause")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Pause game", description = "Pause a running game.")
    public ResponseEntity<?> pauseGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.pauseGame(gameId));
    }

    @PostMapping("/{gameId}/stop")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Stop game", description = "Stop a game and remove containers.")
    public ResponseEntity<?> stopGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.stopGame(gameId));
    }

    @PostMapping("/{gameId}/force-stop")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Force stop game", description = "Force stop a game (including DEPLOYING state). Cleans up containers and images, resets to DRAFT.")
    public ResponseEntity<?> forceStopGame(@PathVariable UUID gameId) {
        return ResponseEntity.ok(gameClient.forceStopGame(gameId));
    }

    // ======================== GAME TEAMS ========================

    @PostMapping("/{gameId}/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Add team to game", description = "Add a team to participate in a game.")
    public ResponseEntity<GameTeamResponse> addTeamToGame(
            @PathVariable UUID gameId,
            @Valid @RequestBody GameTeamRequest request) {
        return ResponseEntity.ok(gameClient.addTeamToGame(gameId, request));
    }

    @GetMapping("/{gameId}/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List game teams", description = "Get all teams participating in a game.")
    public ResponseEntity<List<GameTeamResponse>> getGameTeams(@PathVariable UUID gameId) {
        List<GameTeamResponse> teams = gameClient.getGameTeams(gameId);
        
        // Enrich each team with team name from wrapper's database
        teams.forEach(team -> {
            if (team.getTeamId() != null) {
                teamRepository.findById(team.getTeamId())
                    .ifPresent(entity -> team.setTeamName(entity.getName()));
            }
        });
        
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{gameId}/teams/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get game team details", description = "Get details of a team in a game including container info. STUDENT users can only view their own team.")
    public ResponseEntity<?> getGameTeam(
            @PathVariable UUID gameId,
            @PathVariable String teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // SECURITY: STUDENT users can only view their own team's information
        boolean isStudent = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        
        if (isStudent) {
            String authenticatedTeamId = userDetails.getTeamId();
            String authenticatedTeamName = userDetails.getTeamName();
            
            // Student must have a team assigned
            if (authenticatedTeamId == null) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "You are not assigned to any team",
                    "success", false
                ));
            }
            
            // Check if the requested teamId matches the authenticated user's team (by ID or name)
            boolean isOwnTeam = teamId.equals(authenticatedTeamId) || 
                               (authenticatedTeamName != null && teamId.equals(authenticatedTeamName));
            
            if (!isOwnTeam) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "You can only view your own team's information",
                    "yourTeamId", authenticatedTeamId,
                    "success", false
                ));
            }
        }
        
        GameTeamResponse team = gameClient.getGameTeam(gameId, teamId);
        
        // Enrich with team name from wrapper's database
        if (team.getTeamId() != null) {
            teamRepository.findById(team.getTeamId())
                .ifPresent(entity -> team.setTeamName(entity.getName()));
        }
        
        return ResponseEntity.ok(team);
    }

    @PatchMapping("/{gameId}/teams/{gameTeamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update game team", description = "Update game team details including team_id. Requires ADMIN role.")
    public ResponseEntity<?> updateGameTeam(
            @PathVariable UUID gameId,
            @PathVariable String gameTeamId,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(gameClient.updateGameTeam(gameId, gameTeamId, updates));
    }

    @DeleteMapping("/{gameId}/teams/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Remove team from game", description = "Remove a team from a game.")
    public ResponseEntity<?> removeTeamFromGame(
            @PathVariable UUID gameId,
            @PathVariable String teamId) {
        return ResponseEntity.ok(gameClient.removeTeamFromGame(gameId, teamId));
    }

    // ======================== ASSIGN VULNBOX & CHECKER ========================

    @PostMapping("/{gameId}/assign-vulnbox")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Assign vulnbox to game", description = "Assign an uploaded vulnbox to a game.")
    public ResponseEntity<GameResponse> assignVulnbox(
            @PathVariable UUID gameId,
            @Parameter(description = "Vulnbox UUID") @RequestParam UUID vulnboxId) {
        return ResponseEntity.ok(gameClient.assignVulnbox(gameId, vulnboxId));
    }

    @PostMapping("/{gameId}/assign-checker")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Assign checker to game", description = "Assign an uploaded checker to a game.")
    public ResponseEntity<GameResponse> assignChecker(
            @PathVariable UUID gameId,
            @Parameter(description = "Checker UUID") @RequestParam UUID checkerId) {
        return ResponseEntity.ok(gameClient.assignChecker(gameId, checkerId));
    }
}
