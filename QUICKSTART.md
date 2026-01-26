# Quick Start Guide - Account System

## Prerequisites
- PostgreSQL running on localhost:5432
- Java 19+
- Node.js with npm
- Maven

## Backend Setup & Run

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will start at: **http://localhost:8080**

## Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at: **http://localhost:5173**

## Quick Test Flow

1. **Sign Up**
   - Go to http://localhost:5173/signup
   - Enter email, name, password (min 6 chars)
   - Confirm password matches
   - Click "Continue"

2. **Login**
   - Go to http://localhost:5173/login
   - Enter email and password
   - Click "Log in"

3. **Access Dashboard**
   - You'll be redirected to the editor page
   - Protected routes require valid JWT token

4. **Access Admin Panel** (requires admin role)
   - Go to http://localhost:5173/admin
   - View all users
   - Promote/demote users
   - Delete users

## Make a User Admin (First Time Setup)

### Option 1: Database Query
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Option 2: Another Admin Promotes You
- An existing admin can promote you via the admin panel

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Validate Token
```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Users (Admin Only)
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port Already in Use
- Backend (8080): Kill process or change `server.port` in `application.properties`
- Frontend (5173): Change port in `vite.config.ts`

### Database Connection Error
- Ensure PostgreSQL is running
- Check credentials in `application.properties`
- Database will be created automatically

### CORS Errors
- Frontend must be on allowed origin (http://localhost:5173, http://localhost:3000)
- Update CORS config in `SecurityConfig.java` if needed

### Token Validation Failed
- Token may have expired (24-hour validity)
- Login again to get a new token
- Check token format: `Bearer {token}`

### Admin Features Not Working
- Ensure your account has ADMIN role
- Use database query or another admin to promote you

## Key Files Reference

### Backend
- Authentication: `src/main/java/com/lifeflow/backend/controllers/AuthController.java`
- Admin: `src/main/java/com/lifeflow/backend/controllers/AdminController.java`
- JWT: `src/main/java/com/lifeflow/backend/security/JwtTokenProvider.java`
- Config: `src/main/resources/application.properties`

### Frontend
- Auth Service: `src/services/authService.ts`
- Admin Service: `src/services/adminService.ts`
- Login: `src/pages/LoginPage.tsx`
- Signup: `src/pages/SignupPage.tsx`
- Admin Panel: `src/pages/AdminPage.tsx`
- Auth Guard: `src/components/RequireAuth.tsx`

## Environment Variables

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/lifeflow
spring.datasource.username=postgres
spring.datasource.password=36349

# JWT
jwt.secret=lifeflow-secret-key-change-this-in-production
jwt.expiration=86400000

# Server
server.port=8080
```

### Frontend (.env or config)
```
VITE_API_URL=http://localhost:8080/api
```

## Production Checklist

- [ ] Change JWT secret to strong random string (min 32 chars)
- [ ] Update CORS origins to production domain
- [ ] Use environment variables for sensitive config
- [ ] Enable HTTPS
- [ ] Use PostgreSQL in production (not local)
- [ ] Update database credentials
- [ ] Set up password reset functionality
- [ ] Implement email verification
- [ ] Add audit logging
- [ ] Set up monitoring/alerting

## Support

For issues or questions:
1. Check error messages in browser console
2. Check backend logs in terminal
3. Verify database is running
4. Check API endpoints with cURL
5. Refer to ACCOUNT_SYSTEM_IMPLEMENTATION.md for detailed docs
