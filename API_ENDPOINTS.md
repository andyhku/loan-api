# Loan App - Complete API Endpoints List

Based on analysis of the v2 app folder, here are all the necessary API endpoints that need to be implemented.

## Base URL
```
https://www.aiyoucc.com/FinancialAPP
```

## Authentication & User Management

### 1. User Login
- **Endpoint:** `POST /app_login`
- **Description:** User login with account and password
- **Request Body:**
  ```json
  {
    "user_account": "string",
    "user_password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "data": {
      "user_account": "string",
      "user_name": "string",
      "user_cookie": "string (token)",
      // ... other user fields
    },
    "msg": "string"
  }
  ```
- **Used in:** `pages/login/login.vue`

---

### 2. User Registration
- **Endpoint:** `POST /app_register`
- **Description:** Register new user account
- **Request Body:**
  ```json
  {
    "user_name": "string",
    "user_account": "string",
    "user_mobile_number": "string",
    "user_password": "string",
    "user_password_sure": "string",
    "user_age": "string",
    "user_sex": "string (男/女)",
    "Vcode": "string (6-digit verification code)"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** `pages/login/sign/sign.vue`

---

### 3. Get Verification Code
- **Endpoint:** `POST /getVcode`
- **Description:** Send SMS verification code to phone number
- **Request Body:**
  ```json
  {
    "phone": "string",
    "scene": "string (register/reset)"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** 
  - `pages/login/sign/sign.vue` (scene: "register")
  - `pages/login/find-pass/find-pass.vue` (scene: "reset")

---

### 4. Password Recovery (Forgot Password)
- **Endpoint:** `POST /App_password_recovery`
- **Description:** Reset password using account, phone, verification code
- **Request Body:**
  ```json
  {
    "user_account": "string",
    "phone": "string",
    "Vcode": "string",
    "new_password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** `pages/login/find-pass/find-pass.vue`

---

### 5. Change Password (Logged In User)
- **Endpoint:** `POST /appchangepassword`
- **Description:** Change password for logged-in user
- **Headers:**
  ```
  Authorization: Bearer {user_cookie}
  ```
- **Request Body:**
  ```json
  {
    "user_account": "string",
    "user_password": "string (old password)",
    "new_password": "string",
    "new_password_sure": "string"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** `pages/login/pass/pass.vue`

---

## Content & Display

### 6. Get Banners
- **Endpoint:** `GET /appgetbanner`
- **Description:** Get banner/carousel images for home page
- **Headers:** (Optional - may require auth)
  ```
  Authorization: Bearer {user_cookie}
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "data": [
      {
        "image_Name": "string (image URL)",
        "title": "string",
        "image_describe": "string",
        "url": "string (link URL)"
      }
    ]
  }
  ```
- **Used in:** 
  - `pages/home/home.vue`
  - `pages/home/advertising-agency/advertising-agency.vue`

---

## Loan Application

### 7. Submit Loan Application (Simple Form)
- **Endpoint:** `POST /appaddinformation`
- **Description:** Submit simple loan application form
- **Headers:**
  ```
  Authorization: Bearer {user_cookie}
  ```
- **Request Body:**
  ```json
  {
    "Referral_Code": "string",
    "customer_name": "string",
    "customer_phone": "string",
    "apply_limit": "string",
    "notes": "string (optional)",
    "sex": "string (0/1/2)"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** 
  - `pages/form/form.vue`
  - `pages/home/advertising-agency/advertising-agency-two.vue`

---

### 8. Submit Loan Application (Detailed Form)
- **Endpoint:** `POST /appaddinformation`
- **Description:** Submit detailed loan application with all information
- **Headers:**
  ```
  Authorization: Bearer {user_cookie}
  ```
- **Request Body:**
  ```json
  {
    "Referral_Code": "string",
    "customer_name": "string",
    "customer_phone": "string",
    "apply_limit": "string",
    "sex": "string",
    "customer_account": "string",
    "Debt_record": ["string (array of image URLs)"],
    "customer_photos": ["string (array of image URLs, 2-5 images)"],
    "company_information": {
      "gongsiming": "string",
      "dizhi": "string",
      "dianhua": "string",
      "zhiwei": "string",
      "shouru": "string",
      "gongzuonianxian": "string",
      "isor": "string"
    },
    "personal_data": {
      "customer_phone": "string",
      "shenfenzheng": "string",
      "chushengriqi": "string",
      "juzhunianshu": "string",
      "shifougoumai": "string"
    },
    "receiving_bank": {
      "zhanghao": "string",
      "bank_name": "string",
      "shoukuanrenming": "string"
    },
    "contact_person": {
      "contact_person_name": "string",
      "dianhua": "string",
      "guanxi": "string"
    },
    "fuzhaijilu": [
      {
        "jieqianrenname": "string",
        "jine": "string",
        "qishu": "string",
        "yuxiaqishu": "string"
      }
    ],
    "notes": "string (may contain contact list data)"
  }
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "msg": "string"
  }
  ```
- **Used in:** `pages/home/advertising-agency/advertising-agency-two.vue`

---

## File Upload

### 9. Upload Files
- **Endpoint:** `POST /uploadinformations`
- **Description:** Upload customer photos or debt record documents
- **Headers:**
  ```
  Authorization: Bearer {user_cookie}
  cont-sen: json/text/jpg/jpge/png
  ```
- **Request:** Multipart form data
  ```
  file: [File]
  ```
- **Response:**
  ```json
  {
    "code": 200,
    "unique_filename": "string (relative path)",
    "msg": "string"
  }
  ```
- **Used in:** `pages/home/advertising-agency/advertising-agency-two.vue`
- **Note:** Returns relative path, full URL is `{baseURL}{unique_filename}`

---

## Common Response Format

All APIs should follow this response structure:

### Success Response
```json
{
  "code": 200,
  "data": {}, // or array
  "msg": "Success message"
}
```

### Error Response
```json
{
  "code": 401, // or other error codes
  "msg": "Error message"
}
```

### Common Error Codes
- `200` - Success
- `401` - Unauthorized (token expired/invalid)
- `400` - Bad Request
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

---

## Authentication Flow

1. User logs in via `/app_login` → receives `user_cookie` token
2. Token is stored in local storage as `user_info.user_cookie`
3. All subsequent requests include: `Authorization: Bearer {user_cookie}`
4. If token is invalid/expired (401), redirect to login page

---

## Notes

1. **Password Requirements:**
   - Minimum 8 characters
   - Must contain both letters and numbers
   - Regex: `/^(?=.*\d)(?=.*[a-zA-Z]).{9,}$/`

2. **Phone Number Format:**
   - Should be validated (10-15 digits)

3. **File Upload:**
   - Customer photos: 2-5 images required
   - Debt records: Up to 5 images
   - Files are uploaded individually, then URLs are collected

4. **Debt Records:**
   - Can have multiple debt records (up to 10)
   - Each record has: borrower name, amount, installments, remaining installments

5. **Verification Code:**
   - 6-digit code
   - 60-second cooldown between requests
   - Different scenes: "register" and "reset"

---

## Implementation Priority

### Phase 1 (Essential - MVP)
1. ✅ User Login (`/app_login`)
2. ✅ User Registration (`/app_register`)
3. ✅ Get Verification Code (`/getVcode`)
4. ✅ Get Banners (`/appgetbanner`)

### Phase 2 (User Management)
5. ✅ Password Recovery (`/App_password_recovery`)
6. ✅ Change Password (`/appchangepassword`)

### Phase 3 (Loan Application)
7. ✅ Submit Simple Application (`/appaddinformation`)
8. ✅ Upload Files (`/uploadinformations`)
9. ✅ Submit Detailed Application (`/appaddinformation`)

---

## Database Schema Suggestions

### Users Table
- `id` (Primary Key)
- `user_account` (Unique)
- `user_name`
- `user_password` (hashed)
- `user_mobile_number`
- `user_age`
- `user_sex`
- `user_cookie` (token)
- `created_at`
- `updated_at`

### Applications Table
- `id` (Primary Key)
- `customer_account` (Foreign Key → Users)
- `Referral_Code`
- `customer_name`
- `customer_phone`
- `apply_limit`
- `sex`
- `status` (pending/approved/rejected)
- `company_information` (JSON)
- `personal_data` (JSON)
- `receiving_bank` (JSON)
- `contact_person` (JSON)
- `fuzhaijilu` (JSON array)
- `customer_photos` (JSON array)
- `Debt_record` (JSON array)
- `notes`
- `created_at`
- `updated_at`

### Banners Table
- `id` (Primary Key)
- `image_Name` (URL)
- `title`
- `image_describe`
- `url` (link URL)
- `order` (display order)
- `is_active` (boolean)
- `created_at`

### Verification Codes Table
- `id` (Primary Key)
- `phone`
- `code`
- `scene` (register/reset)
- `expires_at`
- `used` (boolean)
- `created_at`

