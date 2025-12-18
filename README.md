# Loan App API Service

A simple, cost-effective API service for user authentication (login/register) deployable to Vercel.

## Features

- ✅ User Registration (phone number + password)
- ✅ User Login (phone number + password)
- ✅ Get User by ID
- ✅ Health Check Endpoint
- ✅ Password hashing with bcrypt
- ✅ Vercel Postgres Database (Free Tier)
- ✅ Serverless Functions (Auto-scaling)

## Cost Breakdown

**Total Monthly Cost: $0 (Free Tier)**

- **Vercel Hosting**: Free tier includes:
  - 100GB bandwidth/month
  - Unlimited serverless function executions
  - Automatic HTTPS
  - Global CDN

- **Vercel Postgres**: Free tier includes:
  - 256 MB storage
  - 60 hours compute time/month
  - Perfect for small to medium applications

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Vercel Account** (Free) - [Sign up](https://vercel.com/signup)
3. **Git** (Optional, for version control)

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
- Directory? (Press Enter for current directory)

### Step 5: Set Up Vercel Postgres Database

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to your Vercel dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose **Free** plan
7. Click **Create**
8. The database credentials will be automatically added as environment variables

#### Option B: Using Vercel CLI

```bash
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_USER
vercel env add POSTGRES_HOST
vercel env add POSTGRES_PASSWORD
vercel env add POSTGRES_DATABASE
```

You'll need to create a Postgres database first in the Vercel dashboard, then copy the connection strings.

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
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
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
├── vercel.json             # Vercel configuration
└── README.md
```

## Security Considerations

1. **Remove init-db endpoint** in production or add authentication
2. **Add rate limiting** for login/register endpoints
3. **Add JWT tokens** for session management (optional)
4. **Use HTTPS** (automatically provided by Vercel)
5. **Validate and sanitize** all inputs (basic validation included)

## Troubleshooting

### Database Connection Issues

1. Check environment variables in Vercel dashboard
2. Ensure Postgres database is created and active
3. Verify database credentials are correct

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
- **Vercel Postgres Pro**: $20/month - More storage and compute time

## Support

For issues:
1. Check Vercel logs: Dashboard → Your Project → Functions → View Logs
2. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
3. Check Postgres documentation: [vercel.com/docs/storage/vercel-postgres](https://vercel.com/docs/storage/vercel-postgres)

## License

ISC

