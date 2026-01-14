-- ==============================================================
-- ATK-DEF Backend Database Schema
-- PostgreSQL DDL Script
-- Schema: public (same as GameCoreServer)
-- ==============================================================

-- NOTE: This schema is now compatible with GameCoreServer
-- GameCoreServer creates most tables automatically via SQLAlchemy
-- This file is kept for reference and manual setup if needed

-- ==============================================================
-- 1. TEAMS TABLE (Wrapper only - for authentication)
-- ==============================================================
CREATE TABLE IF NOT EXISTS teams (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'TEAM',
    name            VARCHAR(100) NOT NULL,
    affiliation     VARCHAR(200),
    country         VARCHAR(50),
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_username ON teams(username);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

COMMENT ON TABLE teams IS 'Team accounts - Wrapper only for authentication';

-- ==============================================================
-- INITIAL DATA: Create Admin Account
-- Password: admin123 (BCrypt hash)
-- ==============================================================
INSERT INTO teams (username, password, role, name)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3YJHgkIvPh2DPFT.Nqje', 'ADMIN', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- ==============================================================
-- OTHER TABLES ARE CREATED BY GAMECORESERVER
-- ==============================================================
-- games           - Created by GameCoreServer
-- game_teams      - Created by GameCoreServer (team_id is VARCHAR, not FK)
-- ticks           - Created by GameCoreServer
-- flags           - Created by GameCoreServer
-- flag_submissions - Created by GameCoreServer
-- service_statuses - Created by GameCoreServer
-- scoreboard      - Created by GameCoreServer
-- vulnboxes       - Created by GameCoreServer
-- checkers        - Created by GameCoreServer
-- ==============================================================
