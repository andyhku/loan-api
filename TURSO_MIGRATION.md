# Migration to Turso Database

This document outlines the changes made to migrate from Vercel Postgres to Turso (SQLite-based database).

## Changes Made

### 1. Package Dependencies
- **Removed:** `@vercel/postgres`
- **Added:** `@libsql/client`

### 2. Database Client Setup
The database client is now initialized using Turso:

```javascript
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### 3. SQL Syntax Changes

#### PostgreSQL → SQLite (Turso)

| PostgreSQL | SQLite (Turso) |
|------------|----------------|
| `SERIAL PRIMARY KEY` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `VARCHAR(n)` | `TEXT` |
| `CURRENT_TIMESTAMP` | `datetime('now')` |
| `RETURNING` clause | Separate SELECT query after INSERT/UPDATE |
| Template literals `` `SELECT * FROM users WHERE id = ${id}` `` | Prepared statements `{ sql: 'SELECT * FROM users WHERE id = ?', args: [id] }` |

### 4. Query Method Changes

**Before (PostgreSQL):**
```javascript
const result = await sql`
  SELECT * FROM users WHERE phone_number = ${phoneNumber}
`;
return result.rows[0];
```

**After (Turso):**
```javascript
const result = await client.execute({
  sql: `SELECT * FROM users WHERE phone_number = ?`,
  args: [phoneNumber]
});
return rowToObject(result.rows[0]);
```

### 5. Environment Variables

**Before:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**After:**
- `TURSO_DATABASE_URL` - Database connection URL
- `TURSO_AUTH_TOKEN` - Authentication token

## Files Modified

1. **package.json** - Updated dependencies
2. **lib/db.js** - Complete rewrite for Turso client
3. **api/health.js** - Updated to use Turso client
4. **README.md** - Updated setup instructions

## Benefits of Turso

1. **Free Tier:**
   - 500 databases
   - 2 billion rows read/month
   - 50 million rows written/month
   - 9 GB storage

2. **Performance:**
   - Edge-replicated SQLite
   - Low latency globally
   - Fast queries

3. **Simplicity:**
   - SQLite syntax (easier than PostgreSQL)
   - Simple connection setup
   - No complex connection pooling needed

## Setup Instructions

See the main README.md for complete setup instructions. Quick setup:

1. Create Turso account at [turso.tech](https://turso.tech)
2. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
3. Create database: `turso db create loan-api`
4. Get credentials:
   - URL: `turso db show loan-api --url`
   - Token: `turso db tokens create loan-api`
5. Add to Vercel environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

## Testing

After migration, test all endpoints:
- Health check: `GET /api/health`
- User registration: `POST /api/users/register`
- User login: `POST /api/users/login`
- Get user: `GET /api/users/[id]`

