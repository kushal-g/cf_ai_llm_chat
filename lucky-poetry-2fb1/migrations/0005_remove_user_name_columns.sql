-- Remove first_name and last_name columns from users table
-- Date: 2025-10-28
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Step 1: Create new users table without first_name and last_name
CREATE TABLE users_new (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);

-- Step 2: Copy data from old table to new table
INSERT INTO users_new (user_id, username, password, created_at, updated_at)
SELECT user_id, username, password, created_at, updated_at
FROM users;

-- Step 3: Drop old table
DROP TABLE users;

-- Step 4: Rename new table to original name
ALTER TABLE users_new RENAME TO users;

-- Step 5: Recreate unique index on username
CREATE UNIQUE INDEX idx_users_username ON users(username);
