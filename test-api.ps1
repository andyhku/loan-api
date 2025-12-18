# PowerShell script to test Loan API endpoints
# Replace YOUR_DOMAIN with your actual Vercel deployment URL

$baseUrl = "https://loan-api-nine.vercel.app"

Write-Host "Testing Loan API Endpoints" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Initialize Database
Write-Host "1. Initializing Database..." -ForegroundColor Yellow
try {
    $uri = $baseUrl + "/api/init-db"
    $response = Invoke-RestMethod -Method POST -Uri $uri
    Write-Host "   Success: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Health Check
Write-Host "2. Health Check..." -ForegroundColor Yellow
try {
    $uri = $baseUrl + "/api/health"
    $response = Invoke-RestMethod -Method GET -Uri $uri
    Write-Host "   Status: $($response.message)" -ForegroundColor Green
    Write-Host "   Database: $($response.database)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Get Verification Code (for registration)
Write-Host "3. Getting Verification Code (Register)..." -ForegroundColor Yellow
try {
    $body = @{
        phone = "+1234567890"
        scene = "register"
    } | ConvertTo-Json
    
    $uri = $baseUrl + "/api/getVcode"
    $response = Invoke-RestMethod -Method POST -Uri $uri -Body $body -ContentType "application/json"
    Write-Host "   Success: $($response.msg)" -ForegroundColor Green
    Write-Host "   Note: Check console logs for the verification code" -ForegroundColor Cyan
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Register User
Write-Host "4. Registering User..." -ForegroundColor Yellow
Write-Host "   Note: Update Vcode with actual code from step 3" -ForegroundColor Cyan
try {
    $vcode = "123456"
    $body = @{
        user_name = "Test User"
        user_account = "testuser123"
        user_mobile_number = "+1234567890"
        user_password = "password123"
        user_password_sure = "password123"
        user_age = "25"
        user_sex = "男"
        Vcode = $vcode
    } | ConvertTo-Json
    
    $uri = $baseUrl + "/api/app_register"
    $response = Invoke-RestMethod -Method POST -Uri $uri -Body $body -ContentType "application/json"
    Write-Host "   Success: $($response.msg)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Login
Write-Host "5. User Login..." -ForegroundColor Yellow
try {
    $body = @{
        user_account = "testuser123"
        user_password = "password123"
    } | ConvertTo-Json
    
    $uri = $baseUrl + "/api/app_login"
    $response = Invoke-RestMethod -Method POST -Uri $uri -Body $body -ContentType "application/json"
    if ($response.code -eq 200) {
        Write-Host "   Success: $($response.msg)" -ForegroundColor Green
        Write-Host "   User: $($response.data.user_name)" -ForegroundColor Green
        Write-Host "   Token: $($response.data.user_cookie.Substring(0, 20))..." -ForegroundColor Cyan
    } else {
        Write-Host "   Error: $($response.msg)" -ForegroundColor Red
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "Testing Complete!" -ForegroundColor Green
