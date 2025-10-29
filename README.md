# AI Chatbot with Cloudflare Workers AI

A full-stack AI chatbot application built with React, TypeScript, and Cloudflare Workers AI. This project demonstrates the integration of Cloudflare's edge computing platform with AI capabilities, featuring user authentication, chat management, and real-time AI responses.

## Live Demo

**Deployed Application:** [https://little-butterfly-16e2.kushalgarg2000.workers.dev](https://little-butterfly-16e2.kushalgarg2000.workers.dev)

**Default Login Credentials:**
- Username: `admin`
- Password: `password123`

## Features

- **AI-Powered Chat**: Leverages Cloudflare Workers AI (Llama 3.1 8B) for intelligent conversations
- **User Authentication**: Secure login/signup with JWT tokens and PBKDF2 password hashing
- **Multiple Chat Sessions**: Create and manage multiple conversation threads
- **Real-time Updates**: Instant message delivery and chat list updates
- **Responsive Design**: Modern, mobile-friendly UI built with React
- **Edge Computing**: Deployed on Cloudflare Workers for global low-latency access
- **D1 Database**: Persistent storage using Cloudflare D1 (SQLite at the edge)

## Architecture

This project consists of two main components:

### Frontend (`little-butterfly-16e2`)
- **Framework**: React 19 + TypeScript + Vite
- **UI Components**: Custom components with FontAwesome icons
- **State Management**: React Context API for authentication
- **Styling**: Inline styles with responsive design
- **Deployment**: Cloudflare Workers with static asset serving

### Backend (`lucky-poetry-2fb1`)
- **Runtime**: Cloudflare Workers
- **AI Model**: Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)
- **Database**: Cloudflare D1 (distributed SQLite)
- **Authentication**: JWT-based with PBKDF2 password hashing
- **API**: RESTful endpoints for chat and auth operations

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Cloudflare Workers, TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Cloudflare Workers AI (Llama 3.1 8B Instruct)
- **Authentication**: JWT tokens, PBKDF2, Web Crypto API
- **Deployment**: Cloudflare Pages + Workers

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd llm
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd lucky-poetry-2fb1

# Install dependencies
npm install

# Login to Cloudflare (if not already logged in)
npx wrangler login

# Create D1 database (if not exists)
npx wrangler d1 create prod-d1-tutorial

# Setup database with automated script
./scripts/setup-database.sh --local

# Start backend development server
npx wrangler dev
```

The backend will be available at `http://localhost:8787`

### 3. Setup Frontend

```bash
# In a new terminal, navigate to frontend directory
cd little-butterfly-16e2

# Install dependencies
npm install

# Update BASE_URL in src/db/index.ts to point to local backend
# Change to: export const BASE_URL = "http://localhost:8787"

# Start frontend development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Start Developing!

Open [http://localhost:5173](http://localhost:5173) and login with:
- Username: `admin`
- Password: `password123`

## Project Structure

```
llm/
├── little-butterfly-16e2/          # Frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── AppBar.tsx        # Top navigation bar
│   │   │   ├── ChatArea.tsx      # Main chat interface
│   │   │   ├── Login.tsx         # Authentication form
│   │   │   ├── SideBar.tsx       # Chat list sidebar
│   │   │   └── ThinkingAnimation.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Authentication state
│   │   ├── db/
│   │   │   └── index.ts          # API client
│   │   ├── hooks/
│   │   │   └── index.ts          # Custom hooks
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── worker/
│   │   └── index.ts              # Cloudflare Worker
│   ├── package.json
│   ├── vite.config.ts
│   └── wrangler.jsonc
│
├── lucky-poetry-2fb1/             # Backend API
│   ├── src/
│   │   └── index.ts              # Worker entry point
│   ├── migrations/                # Database migrations
│   │   ├── 0000_initial_schema.sql
│   │   └── ...
│   ├── scripts/
│   │   └── setup-database.sh     # Database setup script
│   ├── package.json
│   └── wrangler.jsonc
│
└── README.md                      # This file
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,           -- PBKDF2 hashed
    created_at REAL DEFAULT (unixepoch()),
    updated_at REAL DEFAULT (unixepoch())
);
```

### Chats Table
```sql
CREATE TABLE chats (
    chat_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,                       -- Auto-generated from first message
    created_at REAL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
    message TEXT NOT NULL,
    timestamp REAL DEFAULT (unixepoch()),
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);
```

## Database Setup

### Automated Setup (Recommended)

The easiest way to set up the database:

```bash
cd lucky-poetry-2fb1

# For local development
./scripts/setup-database.sh --local

# For production/remote
./scripts/setup-database.sh --remote
```

The script will:
- Create all necessary tables (users, chats, messages)
- Set up indexes for optimal performance
- Create the default admin user
- Verify the database setup

### Manual Setup

If you prefer manual setup:

```bash
cd lucky-poetry-2fb1

# Create the database
npx wrangler d1 create prod-d1-tutorial

# Run the initial schema migration
npx wrangler d1 execute prod-d1-tutorial --local --file=./migrations/0000_initial_schema.sql

# Verify tables were created
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Database Migrations

The project includes these migration files in `lucky-poetry-2fb1/migrations/`:

- **`0000_initial_schema.sql`** - Complete database schema (use this for fresh setup)
- `0001_add_message_id_primary_key.sql` - Historical migration
- `0002_create_chats_table.sql` - Historical migration
- `0003_backfill_chat_titles.sql` - Historical migration
- `0004_create_users_table.sql` - Historical migration
- `0005_remove_user_name_columns.sql` - Historical migration

**For a fresh database setup, only use `0000_initial_schema.sql` or the setup script.**

## API Endpoints

### Authentication

**POST /login**
- Body: `{ username: string, password: string }`
- Returns: `{ access_token: string, user_id: string }`

**POST /signup**
- Body: `{ username: string, password: string }`
- Returns: `{ user_id: string, username: string }`

### Chat Operations

**GET /latest-messages**
- Headers: `Authorization: Bearer <token>`
- Returns: Array of chats with latest messages

**GET /?chatId=<id>**
- Headers: `Authorization: Bearer <token>`
- Returns: Array of messages for the chat

**POST /?chatId=<id>**
- Headers: `Authorization: Bearer <token>`
- Body: `{ userResponse: string }`
- Returns: `{ assistantResponse: string }`

## Configuration

### Frontend Configuration

Update the backend URL in `little-butterfly-16e2/src/db/index.ts`:

```typescript
// For production (deployed backend)
export const BASE_URL = "https://lucky-poetry-2fb1.kushalgarg2000.workers.dev"

// For local development
export const BASE_URL = "http://localhost:8787"
```


## Development

### Frontend Development

```bash
cd little-butterfly-16e2

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run build

# Lint code
npm run lint
```

### Backend Development

```bash
cd lucky-poetry-2fb1

# Install dependencies
npm install

# Start dev server
npx wrangler dev

# Start with remote database
npx wrangler dev --remote

# View logs
npx wrangler tail

# Execute SQL queries
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM users;"
```

## Deployment

### Deploy Backend

```bash
cd lucky-poetry-2fb1

# Setup production database (first time only)
./scripts/setup-database.sh --remote

# Deploy to Cloudflare Workers
npm run deploy
```

### Deploy Frontend

```bash
cd little-butterfly-16e2

# Ensure BASE_URL points to deployed backend
# Update src/db/index.ts

# Build and deploy
npm run deploy
```

### Deploy Both

```bash
# Deploy backend first
cd lucky-poetry-2fb1
npm run deploy

# Then deploy frontend
cd ../little-butterfly-16e2
npm run deploy
```

## Useful Commands

### Database Operations

```bash
cd lucky-poetry-2fb1

# List all D1 databases
npx wrangler d1 list

# Query the database
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM users;"

# List all tables
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check table schema
npx wrangler d1 execute prod-d1-tutorial --local --command="PRAGMA table_info(users);"

# View all chats
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM chats;"

# View messages for a chat
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM messages WHERE chat_id='your-chat-id';"
```

### Wrangler Commands

```bash
# Login to Cloudflare
npx wrangler login

# Check authentication
npx wrangler whoami

# View worker logs (real-time)
npx wrangler tail

# List all workers
npx wrangler deployments list
```

## Security Features

- **Password Hashing**: PBKDF2 with 100,000 iterations and random salt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured CORS headers
- **SQL Injection Protection**: Parameterized queries via D1
- **Constant-time Comparison**: Protection against timing attacks
- **HTTPS Only**: All traffic encrypted in production
- **XSS Protection**: React's built-in escaping

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check you're logged in to Cloudflare
npx wrangler whoami

# If not logged in
npx wrangler login

# Verify database exists
npx wrangler d1 list
```

**Database not found**
```bash
# Create the database
npx wrangler d1 create prod-d1-tutorial

# Run setup script
cd lucky-poetry-2fb1
./scripts/setup-database.sh --local
```

**Tables don't exist**
```bash
cd lucky-poetry-2fb1

# Run the initial schema
npx wrangler d1 execute prod-d1-tutorial --local --file=./migrations/0000_initial_schema.sql

# Or use the automated script
./scripts/setup-database.sh --local
```

**Frontend can't connect to backend**
```bash
# Ensure backend is running
cd lucky-poetry-2fb1
npx wrangler dev

# Check BASE_URL in little-butterfly-16e2/src/db/index.ts
# Should be: http://localhost:8787 for local development
```

**Authentication fails**
```bash
# Check admin user exists
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM users WHERE username='admin';"

# Recreate using setup script
./scripts/setup-database.sh --local
```

**CORS errors**
- Verify backend URL is correct in frontend configuration
- Check browser console for specific CORS errors
- Ensure backend CORS headers are configured properly

**Build errors**
```bash
# Frontend
cd little-butterfly-16e2
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Backend
cd lucky-poetry-2fb1
rm -rf node_modules package-lock.json
npm install
```

**Worker deployment fails**
```bash
# Login to Wrangler
npx wrangler login

# Verify authentication
npx wrangler whoami

# Check wrangler.jsonc configuration
# Ensure database_id is correct
```

**Permission errors with setup script**
```bash
chmod +x lucky-poetry-2fb1/scripts/setup-database.sh
```

### Debugging

**View backend logs**
```bash
cd lucky-poetry-2fb1
npx wrangler tail
```

**Check API responses**
```bash
# Test login endpoint
curl -X POST http://localhost:8787/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test with token
curl http://localhost:8787/latest-messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Database inspection**
```bash
# View all users
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT user_id, username, created_at FROM users;"

# View all chats
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT chat_id, user_id, title FROM chats;"

# View recent messages
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10;"
```

---

**Quick Links:**
- [Live Demo](https://little-butterfly-16e2.kushalgarg2000.workers.dev)
- [Frontend Code](./little-butterfly-16e2/)
- [Backend Code](./lucky-poetry-2fb1/)
