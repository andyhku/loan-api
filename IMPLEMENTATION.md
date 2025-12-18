# Loan API Implementation Summary

This document summarizes the implementation of all 5 authentication endpoints required by the v2 app.

## Implemented Endpoints

### 1. POST /app_login
**Location:** `api/app_login.js`

**Request:**
```json
{
  "user_account": "string",
  "user_password": "string"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "登入成功",
  "data": {
    "id": 1,
    "user_account": "string",
    "user_name": "string",
    "user_mobile_number": "string",
    "user_age": "string",
    "user_sex": "string",
    "user_cookie": "jwt-token",
    "created_at": "timestamp"
  }
}
```

**Features:**
- Validates user account and password
- Generates JWT token (stored as `user_cookie`)
- Returns user data matching app expectations

---

### 2. POST /app_register
**Location:** `api/app_register.js`

**Request:**
```json
{
  "user_name": "string",
  "user_account": "string",
  "user_mobile_number": "string",
  "user_password": "string",
  "user_password_sure": "string",
  "user_age": "string",
  "user_sex": "string (男/女)",
  "Vcode": "string (6-digit)"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "註冊成功"
}
```

**Features:**
- Validates all required fields
- Validates password strength (min 9 chars, must contain letters and numbers)
- Verifies verification code
- Checks for duplicate account/phone
- Creates new user

---

### 3. POST /getVcode
**Location:** `api/getVcode.js`

**Request:**
```json
{
  "phone": "string",
  "scene": "string (register/reset)"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "驗證碼已發送"
}
```

**Features:**
- Generates 6-digit verification code
- Saves code to database (expires in 10 minutes)
- Sends SMS (currently mocked - needs real SMS service integration)
- Supports two scenes: "register" and "reset"

**Note:** Currently uses mock SMS sending. To enable real SMS:
1. Integrate with SMS service (Twilio, AWS SNS, etc.)
2. Update `lib/vcode.js` `sendVerificationCode()` function

---

### 4. POST /App_password_recovery
**Location:** `api/App_password_recovery.js`

**Request:**
```json
{
  "user_account": "string",
  "phone": "string",
  "Vcode": "string",
  "new_password": "string"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "密碼重置成功"
}
```

**Features:**
- Validates user account exists
- Verifies phone matches account
- Verifies verification code
- Validates new password strength
- Updates password

---

### 5. POST /appchangepassword
**Location:** `api/appchangepassword.js`

**Request:**
```json
{
  "user_account": "string",
  "user_password": "string (old password)",
  "new_password": "string",
  "new_password_sure": "string"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "密碼修改成功"
}
```

**Features:**
- Validates old password
- Validates new password strength
- Checks password confirmation match
- Optional JWT token verification
- Updates password

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_account TEXT UNIQUE NOT NULL,
  user_name TEXT,
  user_mobile_number TEXT UNIQUE NOT NULL,
  user_age TEXT,
  user_sex TEXT,
  password_hash TEXT NOT NULL,
  user_cookie TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Verification Codes Table
```sql
CREATE TABLE verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  scene TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## New Utilities

### JWT Token (`lib/jwt.js`)
- `generateToken(user)` - Generates JWT token for user
- `verifyToken(token)` - Verifies JWT token

### Verification Code (`lib/vcode.js`)
- `generateVerificationCode()` - Generates 6-digit code
- `sendVerificationCode(phone, code)` - Sends SMS (currently mocked)

### Database Functions (`lib/db.js`)
- `getUserByAccount(userAccount)` - Get user by account
- `getUserByPhone(phoneNumber)` - Get user by phone
- `createUser(userData)` - Create new user with all fields
- `updateUserCookie(userAccount, token)` - Update user token
- `updateUserPasswordByAccount(userAccount, passwordHash)` - Update password
- `saveVerificationCode(phone, code, scene)` - Save verification code
- `verifyCode(phone, code, scene)` - Verify and mark code as used

---

## Response Format

All endpoints follow the app's expected response format:
```json
{
  "code": 200,  // HTTP-like status code (200 = success, 400 = bad request, 401 = unauthorized, etc.)
  "msg": "string",  // Message in Chinese
  "data": {}  // Optional data object
}
```

**Important:** All responses return HTTP 200 status, but use `code` field to indicate success/error. This matches the app's expectations.

---

## Environment Variables

Add to `.env.local` and Vercel:
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
JWT_SECRET=your-secret-key-change-in-production
```

---

## Password Requirements

- Minimum 9 characters
- Must contain at least one digit
- Must contain at least one letter
- Regex: `/^(?=.*\d)(?=.*[a-zA-Z]).{9,}$/`

---

## Verification Code

- 6-digit numeric code
- Expires in 10 minutes
- Single use (marked as used after verification)
- Supports scenes: "register" and "reset"

---

## Next Steps

1. **Initialize Database:**
   ```bash
   curl -X POST https://YOUR_DOMAIN.vercel.app/api/init-db
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   - Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel
   - Add `JWT_SECRET` for production (optional, defaults to insecure key)

4. **Integrate Real SMS Service:**
   - Update `lib/vcode.js` `sendVerificationCode()` function
   - Add SMS service credentials to environment variables

5. **Test Endpoints:**
   - Use the test-api.http file or Postman
   - Test all 5 endpoints with valid data

---

## Testing

Example test requests are in `test-api.http`. Update the base URL and test each endpoint.

---

## Notes

- All error messages are in Chinese to match the app
- JWT tokens expire in 30 days
- Verification codes expire in 10 minutes
- Password validation matches app requirements exactly
- All endpoints return HTTP 200 with `code` field for status

