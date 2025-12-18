# Loan App API Service

A simple, cost-effective API service for user authentication (login/register) deployable to Vercel.

## Features

- ✅ User Registration (phone number + password)
- ✅ User Login (phone number + password)
- ✅ Get User by ID
- ✅ Health Check Endpoint
- ✅ Password hashing with bcrypt
- ✅ Turso Database (SQLite-based, Free Tier)
- ✅ Serverless Functions (Auto-scaling)

## Cost Breakdown

**Total Monthly Cost: $0 (Free Tier)**

- **Vercel Hosting**: Free tier includes:
  - 100GB bandwidth/month
  - Unlimited serverless function executions
  - Automatic HTTPS
  - Global CDN

- **Turso Database**: Free tier includes:
  - 500 databases
  - 2 billion rows read/month
  - 50 million rows written/month
  - 9 GB storage
  - Perfect for small to medium applications

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Vercel Account** (Free) - [Sign up](https://vercel.com/signup)
3. **Turso Account** (Free) - [Sign up](https://turso.tech)
4. **Git** (Optional, for version control)

## Step-by-Step Deployment Guide

### Step 1: Install Dependencies

```bash
cd loan-api
npm install
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub, GitLab, or email

### Step 3: Install Vercel CLI

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

### Step 4: Link Project to Vercel

```bash
cd loan-api
vercel login
vercel link
```

Follow the prompts:
- Set up and develop? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default: `loan-api`)
- **Framework Preset?** Select **"Other"** or **"No Framework"**
- Directory? (Press Enter for current directory: `./`)
- Override settings? (Press Enter for No)

### Step 5: Set Up Turso Database

#### Create Turso Account and Database

1. Go to [turso.tech](https://turso.tech) and sign up for a free account
2. After logging in, create a new database:
   ```bash
   # Install Turso CLI (if not already installed)
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Create a new database
   turso db create loan-api
   ```
3. Get your database URL and auth token:
   ```bash
   # Get database URL
   turso db show loan-api --url
   
   # Create an auth token
   turso db tokens create loan-api
   ```

#### Add Environment Variables to Vercel

1. Go to your Vercel dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `TURSO_DATABASE_URL` - Your Turso database URL (from step above)
   - `TURSO_AUTH_TOKEN` - Your Turso auth token (from step above)

Or use Vercel CLI:
```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
```

**For local development**, create a `.env.local` file:
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### Step 6: Initialize Database

After deployment, call the initialization endpoint to create the users table:

```bash
# Replace YOUR_DOMAIN with your Vercel deployment URL
curl -X POST https://YOUR_DOMAIN.vercel.app/api/init-db
```

Or visit in browser:
```
https://YOUR_DOMAIN.vercel.app/api/init-db
```

**Note**: This endpoint should be called once after first deployment. You may want to remove or protect this endpoint in production.

### Step 7: Deploy to Production

```bash
vercel --prod
```

Or push to your connected Git repository (Vercel will auto-deploy).

### Step 8: Test Your API

Your API will be available at: `https://YOUR_PROJECT_NAME.vercel.app`

#### Test Health Endpoint:
```bash
curl https://YOUR_PROJECT_NAME.vercel.app/api/health
```

#### Test User Registration:
```bash
curl -X POST https://YOUR_PROJECT_NAME.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "password": "password123"
  }'
```

#### Test User Login:
```bash
curl -X POST https://YOUR_PROJECT_NAME.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "password": "password123"
  }'
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API health status and database connection status.

### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login User
```
POST /api/users/login
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User by ID
```
GET /api/users/123
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Local Development

### Run Locally

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file:
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

3. Run development server:
```bash
vercel dev
```

4. Initialize database (first time only):
```bash
curl -X POST http://localhost:3000/api/init-db
```

## Project Structure

```
loan-api/
├── api/
│   ├── health.js           # Health check endpoint
│   ├── init-db.js          # Database initialization
│   └── users/
│       ├── register.js     # User registration
│       ├── login.js        # User login
│       └── [id].js         # Get user by ID
├── lib/
│   ├── db.js               # Database utilities
│   └── auth.js             # Authentication utilities
├── package.json
├── vercel.json             # Vercel configuration (minimal - auto-detects API routes)
└── README.md
```

**Note:** The `vercel.json` file is minimal. Vercel automatically detects API routes in the `api` folder and uses the correct Node.js runtime based on your `package.json`.

## Security Considerations

1. **Remove init-db endpoint** in production or add authentication
2. **Add rate limiting** for login/register endpoints
3. **Add JWT tokens** for session management (optional)
4. **Use HTTPS** (automatically provided by Vercel)
5. **Validate and sanitize** all inputs (basic validation included)

## Troubleshooting

### Database Connection Issues

1. Check environment variables in Vercel dashboard
2. Ensure Turso database is created and active
3. Verify database URL and auth token are correct
4. Make sure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in Vercel environment variables

### Deployment Issues

1. Check Vercel build logs in dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### Function Timeout

- Default timeout is 10 seconds
- For longer operations, upgrade to Pro plan or optimize code

## Upgrading (When You Outgrow Free Tier)

If you need more resources:

- **Vercel Pro**: $20/month - More bandwidth, longer function timeouts
- **Turso Pro**: Starting at $29/month - More storage, rows, and databases

## Support

For issues:
1. Check Vercel logs: Dashboard → Your Project → Functions → View Logs
2. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
3. Check Turso documentation: [docs.turso.tech](https://docs.turso.tech)
4. Check Turso CLI: [docs.turso.tech/cli](https://docs.turso.tech/cli)

## License

ISC

