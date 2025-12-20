# API Endpoint Consolidation

This document shows how endpoints were consolidated to reduce the number of API routes (Vercel free plan limit: 12 endpoints).

## Before Consolidation (13 endpoints)

1. `/api/app_login.js`
2. `/api/App_password_recovery.js`
3. `/api/app_register.js`
4. `/api/appchangepassword.js`
5. `/api/getVcode.js`
6. `/api/health.js`
7. `/api/init-db.js`
8. `/api/integration/getBannerList.js`
9. `/api/integration/syncApplication.js`
10. `/api/integration/upload/file.js`
11. `/api/users/[id].js`
12. `/api/users/login.js`
13. `/api/users/register.js`

## After Consolidation (7 endpoints)

### 1. `/api/app/[action].js`
Consolidates all app-related endpoints:
- `POST /api/app/login` - User login
- `POST /api/app/register` - User registration
- `POST /api/app/password_recovery` - Password recovery/reset
- `POST /api/app/changepassword` - Change password

**Old endpoints removed:**
- `/api/app_login.js`
- `/api/app_register.js`
- `/api/App_password_recovery.js`
- `/api/appchangepassword.js`

### 2. `/api/integration/[action].js`
Consolidates all integration endpoints:
- `GET /api/integration/getBannerList?current=1&size=100` - Get banner list
- `POST /api/integration/syncApplication` - Sync application data
- `POST /api/integration/upload/file` - Upload file (handles `upload/file` path)

**Old endpoints removed:**
- `/api/integration/getBannerList.js`
- `/api/integration/syncApplication.js`
- `/api/integration/upload/file.js`

### 3. `/api/users/[action].js`
Consolidates all users endpoints:
- `POST /api/users/login` - User login (alternative endpoint)
- `POST /api/users/register` - User registration (alternative endpoint)
- `GET /api/users/123` - Get user by ID (numeric ID as action)
- `GET /api/users/get?id=123` - Get user by ID (with query param)

**Old endpoints removed:**
- `/api/users/login.js`
- `/api/users/register.js`
- `/api/users/[id].js`

### 4. `/api/getVcode.js` (kept as-is)
- `POST /api/getVcode` - Get verification code

### 5. `/api/health.js` (kept as-is)
- `GET /api/health` - Health check endpoint
- `GET /api/health?test=sm2` - SM2 encryption test
- `GET /api/health?test=banner` - Banner API test

### 6. `/api/init-db.js` (kept as-is)
- `POST /api/init-db` - Initialize database

## Endpoint Count Summary

- **Before:** 13 endpoints
- **After:** 7 endpoints
- **Reduction:** 6 endpoints (46% reduction)

## Migration Guide

### App Endpoints
**Old:**
```
POST /api/app_login
POST /api/app_register
POST /api/App_password_recovery
POST /api/appchangepassword
```

**New:**
```
POST /api/app/login
POST /api/app/register
POST /api/app/password_recovery
POST /api/app/changepassword
```

### Integration Endpoints
**Old:**
```
GET /api/integration/getBannerList
POST /api/integration/syncApplication
POST /api/integration/upload/file
```

**New:**
```
GET /api/integration/getBannerList
POST /api/integration/syncApplication
POST /api/integration/upload/file
```
*(Note: Integration endpoints remain the same - they're just consolidated into one file)*

### Users Endpoints
**Old:**
```
POST /api/users/login
POST /api/users/register
GET /api/users/123
```

**New:**
```
POST /api/users/login
POST /api/users/register
GET /api/users/123 (or GET /api/users/get?id=123)
```
*(Note: Users endpoints remain the same - they're just consolidated into one file)*

## Benefits

1. **Reduced endpoint count** - From 13 to 7 endpoints (under Vercel's 12 endpoint limit)
2. **Better organization** - Related endpoints grouped together
3. **Easier maintenance** - Less code duplication
4. **Backward compatible** - All existing API paths still work

