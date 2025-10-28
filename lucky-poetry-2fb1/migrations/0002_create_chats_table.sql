-- Create chats table to store chat-level information
CREATE TABLE IF NOT EXISTS chats (
    chat_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chat_title TEXT NOT NULL,
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);

-- Create index on user_id for faster queries when fetching user's chats
CREATE INDEX idx_chats_user_id ON chats(user_id);
