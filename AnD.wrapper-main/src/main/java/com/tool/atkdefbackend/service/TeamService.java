package com.tool.atkdefbackend.service;

import com.tool.atkdefbackend.entity.TeamEntity;
import com.tool.atkdefbackend.entity.UserEntity;
import com.tool.atkdefbackend.model.request.CreateTeamRequest;
import com.tool.atkdefbackend.model.request.UpdateTeamRequest;
import com.tool.atkdefbackend.model.response.TeamResponse;
import com.tool.atkdefbackend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Team Service - Manages teams (pure team info, no credentials)
 * 
 * Teams are now separate from user accounts.
 * Users are assigned to teams by Admin/Teacher via UserController.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    /**
     * Create a single team
     * Teams no longer have credentials - users are assigned separately
     */
    public Map<String, Object> createTeam(CreateTeamRequest request) {
        if (teamRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Team name already exists!");
        }

        TeamEntity team = TeamEntity.builder()
                .name(request.getName())
                .country(request.getCountry())
                .affiliation(request.getAffiliation())
                .ipAddress(request.getIpAddress())
                .build();

        TeamEntity savedTeam = teamRepository.save(team);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedTeam.getId());
        response.put("name", savedTeam.getName());
        response.put("message", "Team created successfully. Assign users to this team via the Users endpoint.");
        
        log.info("Team created: {} (ID: {})", savedTeam.getName(), savedTeam.getId());
        return response;
    }

    /**
     * Import teams from CSV
     * Format: name,country,affiliation,ip_address
     */
    @Transactional
    public Map<String, Object> importTeamsFromCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        List<Map<String, Object>> createdTeams = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int lineNumber = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                if (line.trim().isEmpty()) continue;

                String[] columns = line.split(",", -1);
                if (columns.length < 1) {
                    errors.add("Line " + lineNumber + ": Invalid format");
                    continue;
                }

                String name = columns[0].trim();
                if (name.isEmpty()) {
                    errors.add("Line " + lineNumber + ": Name required");
                    continue;
                }

                if (teamRepository.existsByName(name)) {
                    errors.add("Line " + lineNumber + ": Team '" + name + "' exists");
                    continue;
                }

                String country = columns.length > 1 ? columns[1].trim() : "";
                String affiliation = columns.length > 2 ? columns[2].trim() : "";
                String ipAddress = columns.length > 3 ? columns[3].trim() : "";

                TeamEntity team = TeamEntity.builder()
                        .name(name)
                        .country(country.isEmpty() ? null : country)
                        .affiliation(affiliation.isEmpty() ? null : affiliation)
                        .ipAddress(ipAddress.isEmpty() ? null : ipAddress)
                        .build();
                
                TeamEntity savedTeam = teamRepository.save(team);

                Map<String, Object> teamInfo = new HashMap<>();
                teamInfo.put("id", savedTeam.getId());
                teamInfo.put("name", name);
                createdTeams.add(teamInfo);
            }

        } catch (Exception e) {
            log.error("CSV Import failed", e);
            throw new RuntimeException("Failed to process CSV: " + e.getMessage());
        }

        log.info("Imported {} teams from CSV", createdTeams.size());
        
        return Map.of(
                "success", true,
                "imported_count", createdTeams.size(),
                "teams", createdTeams,
                "errors", errors,
                "message", "Teams created. Assign users via the Users endpoint.");
    }

    /**
     * Get all teams
     */
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get team by ID
     */
    public TeamEntity getTeamById(String id) {
        return teamRepository.findById(id).orElse(null);
    }

    /**
     * Get team with members
     */
    public Map<String, Object> getTeamWithMembers(String id) {
        TeamEntity team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", team.getId());
        response.put("name", team.getName());
        response.put("country", team.getCountry());
        response.put("affiliation", team.getAffiliation());
        response.put("ipAddress", team.getIpAddress());
        response.put("memberCount", team.getMemberCount());
        response.put("members", team.getMembers().stream()
                .map(this::mapUserToBasicInfo)
                .collect(Collectors.toList()));
        
        return response;
    }

    /**
     * Update team info
     */
    @Transactional
    public TeamResponse updateTeam(String id, UpdateTeamRequest request) {
        TeamEntity team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        if (request.getName() != null) {
            String newName = request.getName().trim();
            if (!newName.equals(team.getName()) && !newName.isEmpty()) {
                if (teamRepository.existsByName(newName)) {
                    throw new IllegalArgumentException("Team name already exists!");
                }
                team.setName(newName);
            }
        }

        if (request.getCountry() != null) team.setCountry(request.getCountry().trim());
        if (request.getAffiliation() != null) team.setAffiliation(request.getAffiliation().trim());
        if (request.getIpAddress() != null) team.setIpAddress(request.getIpAddress().trim());

        TeamEntity savedTeam = teamRepository.save(team);
        return mapToResponse(savedTeam);
    }

    /**
     * Delete team by ID
     */
    public void deleteTeam(String id) {
        if (!teamRepository.existsById(id)) {
            throw new IllegalArgumentException("Team not found");
        }
        teamRepository.deleteById(id);
        log.info("Team deleted: ID={}", id);
    }

    // === Helper Methods ===

    private TeamResponse mapToResponse(TeamEntity team) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .country(team.getCountry())
                .affiliation(team.getAffiliation())
                .ipAddress(team.getIpAddress())
                .build();
    }

    private Map<String, Object> mapUserToBasicInfo(UserEntity user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("displayName", user.getDisplayName());
        info.put("role", user.getRole());
        return info;
    }
}