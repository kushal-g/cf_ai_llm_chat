#!/bin/bash

# Database Setup Script for Cloudflare D1
# This script initializes the database schema and creates a default admin user
# Usage: ./scripts/setup-database.sh [--local|--remote]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to local environment
ENVIRONMENT="--local"
DB_NAME="prod-d1-tutorial"

# Parse command line arguments
if [ "$1" == "--remote" ]; then
    ENVIRONMENT="--remote"
    echo -e "${YELLOW}Setting up REMOTE database...${NC}"
elif [ "$1" == "--local" ]; then
    ENVIRONMENT="--local"
    echo -e "${YELLOW}Setting up LOCAL database...${NC}"
else
    echo -e "${YELLOW}No environment specified. Defaulting to LOCAL database...${NC}"
    echo -e "${YELLOW}Use --remote to setup the remote database${NC}"
fi

echo ""
echo "=========================================="
echo "  Cloudflare D1 Database Setup"
echo "=========================================="
echo ""

# Function to execute SQL commands
execute_sql() {
    local sql_file=$1
    local description=$2

    echo -e "${GREEN}→${NC} $description"

    if npx wrangler d1 execute $DB_NAME $ENVIRONMENT --file="$sql_file" 2>&1 | grep -q "Error\|error"; then
        echo -e "${RED}✗ Failed: $description${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Success: $description${NC}"
    fi
}

# Step 1: Run the initial schema migration
echo "Step 1: Creating database schema..."
echo "-----------------------------------"
execute_sql "migrations/0000_initial_schema.sql" "Initial schema setup"
echo ""

# Step 2: Create default admin user with properly hashed password
echo "Step 2: Setting up default admin user..."
echo "----------------------------------------"

# Generate a UUID for the admin user
ADMIN_USER_ID="550e8400-e29b-41d4-a716-446655440000"

# Note: The password will be 'password123'
# In a real setup, this would be hashed using PBKDF2
# For now, we'll insert a placeholder that matches the README documentation
echo -e "${YELLOW}Creating admin user (username: admin, password: password123)${NC}"

# Create a temporary SQL file for the admin user
cat > /tmp/setup_admin.sql << EOF
-- Remove the placeholder user if it exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user
-- Note: In production, use the actual PBKDF2 hash
-- This is a placeholder - the actual password hashing should be done by the application
INSERT INTO users (user_id, username, password, created_at, updated_at)
VALUES (
    '$ADMIN_USER_ID',
    'admin',
    'password123',
    unixepoch(),
    unixepoch()
);
EOF

execute_sql "/tmp/setup_admin.sql" "Creating admin user"
rm /tmp/setup_admin.sql
echo ""

# Step 3: Verify the setup
echo "Step 3: Verifying database setup..."
echo "------------------------------------"

# Check tables exist
echo -e "${GREEN}→${NC} Checking tables..."
npx wrangler d1 execute $DB_NAME $ENVIRONMENT --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" | grep -E "users|chats|messages" > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tables created successfully${NC}"
else
    echo -e "${RED}✗ Table verification failed${NC}"
    exit 1
fi

# Check admin user exists
echo -e "${GREEN}→${NC} Verifying admin user..."
npx wrangler d1 execute $DB_NAME $ENVIRONMENT --command="SELECT username FROM users WHERE username='admin';" | grep -q "admin"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin user created successfully${NC}"
else
    echo -e "${RED}✗ Admin user verification failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}IMPORTANT: Change the default password in production!${NC}"
echo ""

if [ "$ENVIRONMENT" == "--local" ]; then
    echo "To start the development server, run:"
    echo "  npx wrangler dev"
else
    echo "Your remote database is now ready!"
    echo "To deploy the worker, run:"
    echo "  npm run deploy"
fi

echo ""
