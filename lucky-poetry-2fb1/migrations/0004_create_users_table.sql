-- Create users table to store user authentication and profile information
-- Date: 2025-10-28

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);

-- Create unique index on username for faster lookups and to enforce uniqueness
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Insert a default test user for development
-- Note: In production, passwords should be hashed using bcrypt or similar
INSERT INTO users (user_id, username, password)
VALUES ('123', 'admin', 'password123');
