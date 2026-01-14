-- Migration Script: User-Team Separation
-- Run this on the PostgreSQL database to migrate from old schema to new schema

-- Step 1: Create the new users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    display_name VARCHAR(100),
    affiliation VARCHAR(200),
    team_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_team FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE SET NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS ix_users_created ON users(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_username ON users(username);

-- Step 2: Migrate existing users from teams table to users table
-- This migrates ADMIN and TEACHER accounts
INSERT INTO users (id, username, password, role, display_name, affiliation, created_at)
SELECT id, username, password, role, name, affiliation, created_at
FROM teams
WHERE role IN ('ADMIN', 'TEACHER')
ON CONFLICT (username) DO NOTHING;

-- Step 3: Migrate TEAM accounts to users table (they become STUDENT accounts)
INSERT INTO users (username, password, role, display_name, affiliation, created_at)
SELECT username, password, 'STUDENT', name, affiliation, created_at
FROM teams
WHERE role = 'TEAM'
ON CONFLICT (username) DO NOTHING;

-- Step 4: Remove credential columns from teams table
-- First, backup the old data (optional, comment out if not needed)
-- CREATE TABLE teams_backup AS SELECT * FROM teams;

-- Step 5: Alter teams table to remove credential columns
-- Note: This is destructive - make sure data is migrated first!
-- Run these commands manually after verifying migration:

-- ALTER TABLE teams DROP COLUMN IF EXISTS username;
-- ALTER TABLE teams DROP COLUMN IF EXISTS password;
-- ALTER TABLE teams DROP COLUMN IF EXISTS role;

-- Step 6: Drop old indexes that reference removed columns
-- DROP INDEX IF EXISTS ix_teams_role;
-- DROP INDEX IF EXISTS uk_teams_username;
-- DROP INDEX IF EXISTS ukhgw575vboap64qcyfd83ra0n8;

-- Step 7: Update sequence for users table to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);

-- Verification queries:
-- SELECT COUNT(*) AS user_count FROM users;
-- SELECT COUNT(*) AS team_count FROM teams;
-- SELECT role, COUNT(*) FROM users GROUP BY role;
