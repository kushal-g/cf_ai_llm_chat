-- Initial Schema Setup
-- This migration creates the complete database schema from scratch
-- Date: 2025-10-29

-- ============================================
-- Users Table
-- ============================================
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- PBKDF2 hashed password
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);

-- Create unique index on username for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- Chats Table
-- ============================================
-- Stores chat-level information and metadata
CREATE TABLE IF NOT EXISTS chats (
    chat_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,  -- Chat title (auto-generated from first message)
    created_at REAL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create index on user_id for faster queries when fetching user's chats
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);

-- ============================================
-- Messages Table
-- ============================================
-- Stores individual messages within chats
CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
    message TEXT NOT NULL,
    timestamp REAL DEFAULT (unixepoch()),
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

-- Create index on chat_id for faster message lookups
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);

-- Create index on timestamp for chronological queries
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- ============================================
-- Default User
-- ============================================
-- Insert default admin user for testing/demo purposes
-- Password: password123 (hashed with PBKDF2)
-- Note: This user will be created by the setup script with proper hashing
INSERT OR IGNORE INTO users (user_id, username, password)
VALUES ('admin-user-id', 'admin', 'hashed-password-will-be-replaced');
