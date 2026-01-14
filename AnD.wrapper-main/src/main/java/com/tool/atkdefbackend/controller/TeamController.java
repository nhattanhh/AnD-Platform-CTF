package com.tool.atkdefbackend.controller;

import com.tool.atkdefbackend.model.request.CreateTeamRequest;
import com.tool.atkdefbackend.model.request.UpdateTeamRequest;
import com.tool.atkdefbackend.model.response.TeamResponse;
import com.tool.atkdefbackend.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Team Management Controller
 */
@RestController
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "👥 **Team Management** - CRUD operations for CTF teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Create a team", description = "Create a new team with auto-generated credentials")
    public ResponseEntity<?> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        Map<String, Object> result = teamService.createTeam(request);
        return ResponseEntity.status(201).body(result);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Bulk import teams", description = "Import multiple teams from CSV file")
    public ResponseEntity<?> importTeams(
            @Parameter(description = "CSV file with columns: name,country,affiliation,ip_address")
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> team = teamService.importTeamsFromCsv(file);
        return ResponseEntity.status(201).body(team);
    }

    @GetMapping
    @Operation(summary = "List all teams", description = "Get all registered teams (public)")
    public ResponseEntity<?> getAllTeams() {
        List<TeamResponse> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update team", description = "Update team details")
    public ResponseEntity<?> updateTeam(
            @Parameter(description = "Team ID") @PathVariable String id,
            @RequestBody UpdateTeamRequest request) {
        TeamResponse team = teamService.updateTeam(id, request);
        return ResponseEntity.ok(team);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete team", description = "Remove a team from the system")
    public ResponseEntity<?> deleteTeam(@Parameter(description = "Team ID") @PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok(Map.of("message", "Team deleted successfully"));
    }
}
