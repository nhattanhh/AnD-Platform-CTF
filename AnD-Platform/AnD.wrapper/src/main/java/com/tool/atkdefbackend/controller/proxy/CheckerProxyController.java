package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.CheckerClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Checker Proxy Controller - Refactored with CheckerClient.
 * 
 * Admin API for managing checker scripts.
 */
@Slf4j
@RestController
@RequestMapping("/api/proxy/checkers")
@Tag(name = "Checker Proxy", description = "🔍 Checker Management - Upload and manage checker scripts")
@RequiredArgsConstructor
public class CheckerProxyController {

    private final CheckerClient checkerClient;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Upload checker", description = "Upload a new checker script")
    public ResponseEntity<?> uploadChecker(
            @Parameter(description = "Checker name") @RequestParam String name,
            @Parameter(description = "Description") @RequestParam(required = false) String description,
            @Parameter(description = "Checker script file") @RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading checker: {}", name);
            Map<String, Object> result = checkerClient.uploadChecker(name, description, file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("Failed to upload checker: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to upload file: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List checkers", description = "Get all uploaded checkers")
    public ResponseEntity<?> listCheckers(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit) {
        Map<String, Object> result = checkerClient.listCheckers(skip, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{checkerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get checker", description = "Get checker details by ID")
    public ResponseEntity<?> getChecker(@PathVariable UUID checkerId) {
        Map<String, Object> result = checkerClient.getChecker(checkerId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{checkerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete checker", description = "Delete a checker by ID")
    public ResponseEntity<?> deleteChecker(@PathVariable UUID checkerId) {
        log.info("Deleting checker: {}", checkerId);
        Map<String, Object> result = checkerClient.deleteChecker(checkerId);
        return ResponseEntity.ok(result);
    }
}
