package com.tool.atkdefbackend.controller.proxy;

import com.tool.atkdefbackend.client.VulnboxClient;
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
 * Vulnbox Proxy Controller - Refactored with VulnboxClient.
 * 
 * Admin API for managing vulnbox docker images.
 */
@Slf4j
@RestController
@RequestMapping("/api/proxy/vulnboxes")
@Tag(name = "Vulnbox Proxy", description = "🐳 Vulnbox Management - Upload and manage vulnbox docker images")
@RequiredArgsConstructor
public class VulnboxProxyController {

    private final VulnboxClient vulnboxClient;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Upload vulnbox", description = "Upload a new vulnbox docker image")
    public ResponseEntity<?> uploadVulnbox(
            @Parameter(description = "Vulnbox name") @RequestParam String name,
            @Parameter(description = "Description") @RequestParam(required = false) String description,
            @Parameter(description = "Docker image file") @RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading vulnbox: {}", name);
            Map<String, Object> result = vulnboxClient.uploadVulnbox(name, description, file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("Failed to upload vulnbox: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to upload file: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "List vulnboxes", description = "Get all uploaded vulnboxes")
    public ResponseEntity<?> listVulnboxes(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit) {
        Map<String, Object> result = vulnboxClient.listVulnboxes(skip, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{vulnboxId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get vulnbox", description = "Get vulnbox details by ID")
    public ResponseEntity<?> getVulnbox(@PathVariable UUID vulnboxId) {
        Map<String, Object> result = vulnboxClient.getVulnbox(vulnboxId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{vulnboxId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete vulnbox", description = "Delete a vulnbox by ID")
    public ResponseEntity<?> deleteVulnbox(@PathVariable UUID vulnboxId) {
        log.info("Deleting vulnbox: {}", vulnboxId);
        Map<String, Object> result = vulnboxClient.deleteVulnbox(vulnboxId);
        return ResponseEntity.ok(result);
    }
}
