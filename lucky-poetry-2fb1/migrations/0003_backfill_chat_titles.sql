-- Backfill chat_title for existing chats
-- This migration creates chat entries for any chat_ids that have messages but no chat record

-- Insert into chats table for all chat_ids that don't have a chat entry yet
-- We'll use the first user message as the basis for the title (truncated to 50 chars)
INSERT INTO chats (chat_id, user_id, chat_title, created_at, updated_at)
SELECT DISTINCT
    cm.chat_id,
    '123' as user_id,  -- Using default user_id since we don't have authentication yet
    CASE
        WHEN LENGTH(first_message.message) > 50
        THEN SUBSTR(first_message.message, 1, 50) || '...'
        ELSE first_message.message
    END as chat_title,
    MIN(cm.timestamp) as created_at,
    MAX(cm.timestamp) as updated_at
FROM chat_messages cm
LEFT JOIN chats c ON cm.chat_id = c.chat_id
INNER JOIN (
    -- Get the first user message for each chat
    SELECT cm1.chat_id, cm1.message
    FROM chat_messages cm1
    INNER JOIN (
        SELECT chat_id, MIN(timestamp) as first_timestamp
        FROM chat_messages
        WHERE sender = 'user'
        GROUP BY chat_id
    ) cm2 ON cm1.chat_id = cm2.chat_id AND cm1.timestamp = cm2.first_timestamp
    WHERE cm1.sender = 'user'
) first_message ON cm.chat_id = first_message.chat_id
WHERE c.chat_id IS NULL  -- Only insert if chat doesn't already exist
GROUP BY cm.chat_id;
