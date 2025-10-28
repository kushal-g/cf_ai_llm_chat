-- Migration: Add message_id as primary key to chat_messages table
-- Date: 2025-10-28

-- SQLite doesn't support ALTER TABLE to change primary key directly
-- We need to recreate the table with the new schema

-- Step 1: Create new table with message_id as primary key
CREATE TABLE chat_messages_new (
    message_id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    timestamp REAL,
    message TEXT,
    sender TEXT
);

-- Step 2: Copy data from old table to new table (generating UUIDs for message_id)
-- Note: In production, you'll need to handle message_id generation
-- For now, we'll use a combination of chat_id and timestamp as message_id
INSERT INTO chat_messages_new (message_id, chat_id, timestamp, message, sender)
SELECT
    chat_id || '_' || CAST(timestamp AS TEXT) || '_' || CAST(RANDOM() AS TEXT) as message_id,
    chat_id,
    timestamp,
    message,
    sender
FROM chat_messages;

-- Step 3: Drop old table
DROP TABLE chat_messages;

-- Step 4: Rename new table to original name
ALTER TABLE chat_messages_new RENAME TO chat_messages;

-- Step 5: Create index on chat_id for faster lookups
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
