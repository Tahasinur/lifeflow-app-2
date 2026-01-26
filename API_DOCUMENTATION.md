# Lifeflow Account System - API Documentation

## Base URL
- Development: `http://localhost:8080`
- Production: `https://your-domain.com` (configure as needed)

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

---

## Authentication Endpoints

### 1. Register New User
Creates a new user account and returns a JWT token.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "userId": 1,
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "token": null,
  "email": null,
  "name": null,
  "role": null,
  "userId": null,
  "message": "User already exists with this email"
}
```

**Validation Rules:**
- Email: Valid format, unique, required
- Password: Minimum 6 characters, required
- Name: Non-empty, required

---

### 2. Login User
Authenticates user with email and password, returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "userId": 1,
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "token": null,
  "email": null,
  "name": null,
  "role": null,
  "userId": null,
  "message": "Invalid email or password"
}
```

---

### 3. Validate Token
Verifies JWT token and returns user information.

**Endpoint:** `POST /api/auth/validate`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "token": null,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "userId": 1,
  "message": "Token valid"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "token": null,
  "email": null,
  "name": null,
  "role": null,
  "userId": null,
  "message": "Invalid token"
}
```

---

## Admin Endpoints

All admin endpoints require:
- Valid JWT token with ADMIN role
- `Authorization: Bearer {jwt_token}` header

### 1. Get All Users
Retrieves list of all users in the system (admin only).

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "createdAt": "2026-01-25T10:00:00",
    "updatedAt": "2026-01-25T10:00:00"
  },
  {
    "id": 2,
    "email": "user@example.com",
    "name": "Regular User",
    "role": "USER",
    "createdAt": "2026-01-25T11:00:00",
    "updatedAt": "2026-01-25T11:00:00"
  }
]
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Only admins can access this resource"
}
```

---

### 2. Promote User to Admin
Elevates user permissions to admin level.

**Endpoint:** `POST /api/admin/users/{userId}/promote`

**Path Parameters:**
- `userId` (required): ID of user to promote

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "token": null,
  "email": "user@example.com",
  "name": "Promoted User",
  "role": "ADMIN",
  "userId": 2,
  "message": "User promoted to admin"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Only admins can promote users"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "User not found"
}
```

---

### 3. Demote User from Admin
Removes admin privileges from a user.

**Endpoint:** `POST /api/admin/users/{userId}/demote`

**Path Parameters:**
- `userId` (required): ID of admin user to demote

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "token": null,
  "email": "admin@example.com",
  "name": "Demoted User",
  "role": "USER",
  "userId": 1,
  "message": "User demoted to regular user"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Only admins can demote users"
}
```

---

### 4. Delete User
Removes a user account from the system.

**Endpoint:** `DELETE /api/admin/users/{userId}`

**Path Parameters:**
- `userId` (required): ID of user to delete

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Only admins can delete users"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "User not found"
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Request processed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - User lacks required permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server-side error |

---

## JWT Token Structure

The JWT token contains the following claims:
```json
{
  "sub": "user@example.com",    // Email (Subject)
  "role": "USER",                // User role (USER or ADMIN)
  "iat": 1674639600,             // Issued at (Unix timestamp)
  "exp": 1674726000              // Expiration (Unix timestamp)
}
```

**Token Expiration:** 24 hours from creation

---

## Error Handling

### Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "Email and password are required" | Missing request fields | Provide both email and password |
| "Email, password, and name are required" | Missing registration fields | Provide email, password, and name |
| "Invalid email or password" | Wrong credentials | Check email and password |
| "User already exists with this email" | Email taken | Use different email |
| "Invalid authorization header" | Missing Bearer token | Include "Authorization: Bearer {token}" header |
| "Invalid token" | Token invalid/expired | Login again to get new token |
| "User not found" | User ID doesn't exist | Check user ID |
| "Only admins can..." | User lacks admin role | Promote user to admin first |

---

## Example Workflows

### Complete Registration & Login Flow

**1. Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "name": "New User"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2NzQ2Mzk2MDAsImV4cCI6MTY3NDcyNjAwMH0.xxx",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "USER",
  "userId": 3,
  "message": "User registered successfully"
}
```

**2. Use token to access protected resources:**
```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2NzQ2Mzk2MDAsImV4cCI6MTY3NDcyNjAwMH0.xxx"
```

---

### Admin Management Flow

**1. Login as admin:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass123"
  }'
```

**2. Get all users:**
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer {admin_token}"
```

**3. Promote a user:**
```bash
curl -X POST http://localhost:8080/api/admin/users/3/promote \
  -H "Authorization: Bearer {admin_token}"
```

**4. Delete a user:**
```bash
curl -X DELETE http://localhost:8080/api/admin/users/3 \
  -H "Authorization: Bearer {admin_token}"
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding:
- Login attempts: Max 5 per minute per IP
- API requests: Adjust based on your needs
- Registration: Max 10 per day per IP

---

## CORS Policy

**Allowed Origins:**
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Alternative dev server)

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:**
- All headers (*) for development
- Should be restricted in production

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Never send passwords in logs**
3. **Store JWT tokens securely** (localStorage in browser, secure HttpOnly cookies for backend)
4. **Implement token refresh** mechanism for long-lived sessions
5. **Set strong JWT secret** (minimum 32 characters, random)
6. **Validate all input** on frontend and backend
7. **Use HTTPS** for all API calls
8. **Implement rate limiting** to prevent abuse
9. **Log security events** (failed logins, permission changes)
10. **Regularly rotate secrets** and update dependencies

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-25 | Initial release with auth and admin endpoints |

---

## Support & Contact

For issues or questions:
1. Check error messages and response codes
2. Verify request format and headers
3. Check JWT token validity
4. Review logs for detailed error information
5. Refer to implementation documentation
