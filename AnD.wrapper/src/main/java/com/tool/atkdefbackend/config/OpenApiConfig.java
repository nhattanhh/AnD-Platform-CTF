package com.tool.atkdefbackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Enhanced Swagger/OpenAPI Configuration
 * 
 * Swagger UI: http://localhost:8080/swagger-ui.html
 * OpenAPI JSON: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(servers())
                .components(securityComponents())
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .tags(apiTags())
                .externalDocs(new ExternalDocumentation()
                        .description("GitHub Repository")
                        .url("https://github.com/qthanh04/atk-def-backend"));
    }

    private Info apiInfo() {
        return new Info()
                .title("🛡️ ATK-DEF Backend API")
                .version("2.0.0")
                .description("""
                    # Attack-Defense CTF Platform
                    
                    **API Gateway** between Frontend and Python Game Core Engine.
                    
                    ---
                    
                    ## 🎯 Quick Start
                    
                    1. **Login** via `/api/auth/signin` to get JWT token
                    2. Click **Authorize** button (🔒) above
                    3. Paste your token and click **Authorize**
                    4. Now you can test all protected endpoints!
                    
                    ---
                    
                    ## 📋 API Groups
                    
                    | Group | Description | Auth Required |
                    |-------|-------------|---------------|
                    | **Auth** | Login, Register | ❌ No |
                    | **Teams** | Team CRUD | 🔐 Admin/Teacher |
                    | **Game** | Create, Start, Stop games | 🔐 Admin |
                    | **Submissions** | Flag capture | 🔐 Team |
                    | **Scoreboard** | View scores | ❌ Public |
                    | **Checkers** | Upload checker scripts | 🔐 Admin |
                    | **Vulnboxes** | Upload docker images | 🔐 Admin |
                    
                    ---
                    
                    ## 🔐 Roles & Permissions
                    
                    - **ADMIN** - Full system access
                    - **TEACHER** - Read access + limited game control  
                    - **TEAM** - Submit flags, view own data only
                    - **PUBLIC** - Scoreboard, current tick info
                    """)
                .contact(new Contact()
                        .name("AnD Platform Team")
                        .email("support@andplatform.io")
                        .url("https://andplatform.io"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    private List<Server> servers() {
        return List.of(
                new Server()
                        .url("http://localhost:" + serverPort)
                        .description("🖥️ Local Development"),
                new Server()
                        .url("https://api.andplatform.io")
                        .description("🌐 Production")
        );
    }

    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("""
                            **JWT Authentication**
                            
                            1. Login via `/api/auth/signin`
                            2. Copy the `token` from response
                            3. Paste here (without 'Bearer ' prefix)
                            """));
    }

    private List<Tag> apiTags() {
        return List.of(
                // Authentication & Users
                new Tag()
                        .name("Auth")
                        .description("🔐 **Authentication** - Login, register teams and admins"),
                new Tag()
                        .name("Teams")
                        .description("👥 **Team Management** - CRUD operations for CTF teams"),
                
                // Game Management (ordered by workflow)
                new Tag()
                        .name("Game Proxy")
                        .description("🎮 **Game Control** - Create, configure, start/stop games"),
                new Tag()
                        .name("Checker Proxy")
                        .description("🔍 **Checkers** - Upload and manage service checker scripts"),
                new Tag()
                        .name("Vulnbox Proxy")
                        .description("🐳 **Vulnboxes** - Upload and manage vulnerable Docker images"),
                
                // Gameplay
                new Tag()
                        .name("Submission Proxy")
                        .description("🚩 **Flag Submission** - Core gameplay: capture and submit flags"),
                new Tag()
                        .name("Scoreboard Proxy")
                        .description("📊 **Scoreboard** - Real-time team rankings and scores"),
                
                // Monitoring
                new Tag()
                        .name("Flag Proxy")
                        .description("🏴 **Flags** - View generated flags (admin/teacher only)"),
                new Tag()
                        .name("Tick Proxy")
                        .description("⏱️ **Ticks** - Game tick information and timing"),
                
                // Legacy/Shortcuts
                new Tag()
                        .name("Game Shortcuts")
                        .description("⚡ **Quick Actions** - Start/stop latest game shortcuts"),
                new Tag()
                        .name("Scoreboard")
                        .description("📊 **Public Scoreboard** - Quick access to latest scores")
        );
    }

    // ==================== API Groups for better organization ====================

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("1. Authentication")
                .displayName("🔐 Authentication")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi teamApi() {
        return GroupedOpenApi.builder()
                .group("2. Teams")
                .displayName("👥 Teams")
                .pathsToMatch("/api/teams/**")
                .build();
    }

    @Bean
    public GroupedOpenApi gameApi() {
        return GroupedOpenApi.builder()
                .group("3. Game Management")
                .displayName("🎮 Game Management")
                .pathsToMatch("/api/proxy/games/**", "/api/game/**")
                .build();
    }

    @Bean
    public GroupedOpenApi assetsApi() {
        return GroupedOpenApi.builder()
                .group("4. Game Assets")
                .displayName("📦 Game Assets")
                .pathsToMatch("/api/proxy/checkers/**", "/api/proxy/vulnboxes/**")
                .build();
    }

    @Bean
    public GroupedOpenApi gameplayApi() {
        return GroupedOpenApi.builder()
                .group("5. Gameplay")
                .displayName("🚩 Gameplay")
                .pathsToMatch("/api/proxy/submissions/**", "/api/proxy/flags/**")
                .build();
    }

    @Bean
    public GroupedOpenApi scoreboardApi() {
        return GroupedOpenApi.builder()
                .group("6. Scoreboard & Ticks")
                .displayName("📊 Scoreboard & Ticks")
                .pathsToMatch("/api/proxy/scoreboard/**", "/api/proxy/ticks/**", "/api/scoreboard/**")
                .build();
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("0. All APIs")
                .displayName("📚 All APIs")
                .pathsToMatch("/api/**")
                .build();
    }
}
