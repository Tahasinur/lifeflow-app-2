# Application Testing Guide

## System Status

### Frontend
- **Status**: ✅ Running
- **Port**: 5000
- **URL**: http://localhost:5000
- **Framework**: React + TypeScript
- **Build**: Vite

### Backend
- **Status**: Starting
- **Port**: 8080
- **URL**: http://localhost:8080
- **Framework**: Spring Boot 3.4.1
- **Database**: PostgreSQL (localhost:5432)

---

## Testing Checklist

### 1. Frontend Tests

#### Test 1: Application Loads
```
✅ Expected: Page loads without errors
URL: http://localhost:5000
Expected: Login page or dashboard visible
```

#### Test 2: Login Page Displays
```
✅ Expected: Login form with email and password fields
Elements:
- Email input field
- Password input field
- Login button
- Signup link
```

#### Test 3: Signup Functionality
```
✅ Expected: Can register new account
Steps:
1. Click "Sign up" link
2. Enter name, email, password
3. Click register
4. Should redirect to login or dashboard
```

### 2. Backend API Tests

#### Test 4: Backend Health
```bash
curl http://localhost:8080/api/auth/validate
```

Expected: Response (either success or 401 Unauthorized)

#### Test 5: User Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected Response:
```json
{
  "token": "jwt-token-here",
  "email": "testuser@example.com",
  "userId": 12345,
  "message": "User registered successfully"
}
```

#### Test 6: User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "token": "jwt-token-here",
  "email": "testuser@example.com",
  "userId": 12345,
  "message": "Login successful"
}
```

#### Test 7: Admin Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lifeflow.com",
    "password": "admin123"
  }'
```

Expected Response:
```json
{
  "token": "jwt-token-here",
  "email": "admin@lifeflow.com",
  "role": "ADMIN",
  "userId": 12345,
  "message": "Login successful"
}
```

### 3. Chat System Tests

#### Test 8: Inbox Page Loads
```
✅ Expected: /inbox route loads
Steps:
1. Login as admin
2. Click "Inbox" in sidebar
3. Should see conversation list
```

#### Test 9: Create Conversation
```
✅ Expected: Can create new conversation
Steps:
1. Click "+" button in inbox
2. Select "Direct Message"
3. Enter recipient email
4. Click create
5. Should appear in conversation list
```

#### Test 10: Send Message
```
✅ Expected: Can send message
Steps:
1. Open conversation
2. Type message in input field
3. Click send button
4. Message should appear in history
```

### 4. Dark Mode Tests

#### Test 11: Dark Mode Toggle
```
✅ Expected: Dark mode works
Steps:
1. Open settings (if available)
2. Toggle dark mode
3. Colors should change
4. Should match Lifeflow theme
```

### 5. Responsive Design Tests

#### Test 12: Desktop View (1920x1080)
```
✅ Expected: Layout works on desktop
Elements should:
- Sidebar visible
- Main content area visible
- All buttons accessible
```

#### Test 13: Tablet View (768x1024)
```
✅ Expected: Layout adapts to tablet
Elements should:
- Sidebar might collapse or show differently
- Main content still readable
- Touch targets adequate size
```

#### Test 14: Mobile View (375x667)
```
✅ Expected: Layout works on mobile
Elements should:
- Stack vertically
- Touch targets 44x44px minimum
- Text readable
```

---

## Test Results Template

### Test Summary
- [ ] Frontend loads
- [ ] Login page displays
- [ ] Signup works
- [ ] Backend responds
- [ ] Admin login works
- [ ] Chat system loads
- [ ] Can create conversations
- [ ] Can send messages
- [ ] Dark mode works
- [ ] Responsive design works

### Issues Found
```
(List any issues here)
```

### Recommendations
```
(List any recommendations here)
```

---

## Quick Test Commands

### Using PowerShell

#### Test Backend Availability
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/validate" `
  -Headers @{"Authorization"="Bearer test"} `
  -ErrorAction SilentlyContinue

Write-Host "Backend Status: $($response.StatusCode)"
```

#### Test Admin Login
```powershell
$body = @{
    email = "admin@lifeflow.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json | Select-Object token, email, message
```

#### Test User Registration
```powershell
$body = @{
    email = "testuser@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

---

## Using curl (if available)

```bash
# Health check
curl http://localhost:8080/api/auth/validate

# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lifeflow.com","password":"admin123"}'
```

---

## Expected Results

### ✅ Passing Tests
1. Frontend loads on http://localhost:5000
2. Backend responds on http://localhost:8080
3. Can register new users
4. Can login with admin credentials
5. JWT token is returned
6. Chat system UI is visible
7. Responsive design adapts to screen size
8. Dark mode can be toggled

### ⚠️ Known Limitations
- Chat backend endpoints not yet implemented (UI ready)
- Message persistence requires backend implementation
- WebSocket for real-time not yet integrated
- File upload not yet implemented

---

## Next Steps After Testing

1. Verify all endpoints respond correctly
2. Confirm database connectivity
3. Test full user journey (register → login → chat)
4. Verify token generation and validation
5. Test error handling
6. Check performance under load
7. Verify security measures
8. Test across different browsers

---

## Test Environment Details

### Ports in Use
- **3000**: (available)
- **5000**: Frontend (Vite dev server)
- **8080**: Backend (Spring Boot)
- **5432**: PostgreSQL Database

### Database Connection
- **Host**: localhost
- **Port**: 5432
- **Database**: lifeflow
- **Username**: postgres
- **Password**: 36349

### Environment Variables
None explicitly set (uses defaults in application.properties)

---

## Support

If tests fail:
1. Check backend logs for errors
2. Verify PostgreSQL is running
3. Verify port 8080 is available
4. Check frontend console for errors
5. Verify network connectivity

---

**Test Date**: January 26, 2026
**Test Environment**: Windows + VSCode
**Tester**: Automated Test Suite
