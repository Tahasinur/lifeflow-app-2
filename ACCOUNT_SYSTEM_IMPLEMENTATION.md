# Lifeflow Account System Implementation

## Overview
A complete authentication and admin system has been implemented with JWT-based authentication, user management, and role-based access control.

## Backend Implementation

### 1. Database Models
- **User Entity** (`User.java`)
  - Email (unique)
  - Password (hashed with BCrypt)
  - Name
  - Role (USER or ADMIN)
  - Created/Updated timestamps

- **Role Enum** (`Role.java`)
  - USER: Regular user role
  - ADMIN: Administrator role

### 2. Security
- **JwtTokenProvider** (`JwtTokenProvider.java`)
  - Generates JWT tokens with 24-hour expiration
  - Validates and extracts claims from tokens
  - Uses HS256 signing algorithm

- **SecurityConfig** (`SecurityConfig.java`)
  - BCryptPasswordEncoder for password hashing
  - CORS configuration for frontend integration
  - Allows requests from http://localhost:5173, http://localhost:3000

### 3. API Endpoints

#### Authentication Endpoints (`/api/auth`)
- **POST /register**
  - Request: `{ email, password, name }`
  - Response: `{ token, email, name, role, userId, message }`
  - Returns JWT token on successful registration

- **POST /login**
  - Request: `{ email, password }`
  - Response: `{ token, email, name, role, userId, message }`
  - Returns JWT token on successful login

- **POST /validate**
  - Header: `Authorization: Bearer {token}`
  - Response: `{ email, name, role, userId, message }`
  - Validates token and returns user info

#### Admin Endpoints (`/api/admin`)
- **GET /users**
  - Header: `Authorization: Bearer {token}` (ADMIN only)
  - Returns: Array of all users
  - Only accessible by ADMIN users

- **POST /users/{userId}/promote**
  - Promotes user to ADMIN role
  - Only accessible by ADMIN users

- **POST /users/{userId}/demote**
  - Demotes user from ADMIN to USER role
  - Only accessible by ADMIN users

- **DELETE /users/{userId}**
  - Deletes user account
  - Only accessible by ADMIN users

### 4. Services
- **AuthService** (`AuthService.java`)
  - Handles user registration with duplicate email check
  - Validates credentials during login
  - Token validation
  - User role management (promote/demote/delete)

## Frontend Implementation

### 1. Types
- **User Interface**: Defines user structure with id, email, name, role, timestamps
- **AuthResponse Interface**: API response structure
- **AuthRequest Interface**: API request structure

### 2. Services
- **authService** (`authService.ts`)
  - `register(email, password, name)`: Create account
  - `login(email, password)`: Login and get token
  - `validateToken(token)`: Verify token validity
  - `getToken()`: Retrieve stored token
  - `setToken(token)`: Store token in localStorage
  - `removeToken()`: Clear token on logout
  - `isAuthenticated()`: Check if logged in

- **adminService** (`adminService.ts`)
  - `getAllUsers()`: Fetch all users (admin only)
  - `promoteUserToAdmin(userId)`: Promote user (admin only)
  - `demoteUserToUser(userId)`: Demote user (admin only)
  - `deleteUser(userId)`: Delete user (admin only)

### 3. Pages

#### LoginPage (`LoginPage.tsx`)
- Email and password input fields
- Real authentication with backend
- Error handling with toast notifications
- Loading state during authentication
- Link to signup page

#### SignupPage (`SignupPage.tsx`)
- Email, name, password, and confirm password fields
- Password validation (minimum 6 characters)
- Password match verification
- Error handling with toast notifications
- Loading state during registration
- Link to login page

#### AdminPage (`AdminPage.tsx`)
- Table displaying all users
- Shows email, name, role, creation date
- Promote/Demote buttons (toggle based on role)
- Delete user functionality
- Admin-only access

### 4. Components

#### RequireAuth (`RequireAuth.tsx`)
- Protected route wrapper
- Validates token with backend on mount
- Redirects to login if token invalid or missing
- Shows loading message while validating

### 5. Routes
- `/login` - Login page
- `/signup` - Signup page
- `/` - Dashboard (protected)
- `/admin` - Admin panel (protected, admin-only via backend)
- `/feed` - Feed page (protected)
- `/profile/:userId` - User profile (protected)
- `/trash` - Trash page (protected)

## Security Features

1. **Password Security**
   - Passwords hashed with BCrypt
   - Minimum 6 characters required
   - Validation on signup

2. **JWT Tokens**
   - 24-hour expiration
   - Stored in localStorage
   - Validated on every protected route
   - Includes user email and role in claims

3. **CORS**
   - Configured for localhost development
   - Can be updated for production domains

4. **Role-Based Access**
   - Admin endpoints check user role
   - Only admins can manage users
   - Regular users can't access admin features

## Getting Started

### Backend Setup
1. Ensure PostgreSQL is running on localhost:5432
2. Maven will create the database tables automatically
3. Run the Spring Boot application
4. Backend starts on http://localhost:8080

### Frontend Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Frontend runs on http://localhost:5173

### Testing
1. Navigate to http://localhost:5173/signup
2. Create a new account
3. You'll be logged in automatically
4. Visit http://localhost:5173/admin (redirects to dashboard if not admin)

### Making First User Admin
1. Register an account
2. Manually update the database:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
3. Logout and login again to see admin features

## Configuration

### JWT Secret (Production)
Update in `application.properties`:
```properties
jwt.secret=your-secure-secret-key-minimum-32-chars
jwt.expiration=86400000  # 24 hours in milliseconds
```

### CORS Origins
Update in `SecurityConfig.java`:
```java
configuration.setAllowedOrigins(Arrays.asList("your-domain.com"));
```

### Database
Update in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/lifeflow
spring.datasource.username=your-user
spring.datasource.password=your-password
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## Error Handling

### Common Errors
- **"Invalid email or password"**: Wrong credentials
- **"User already exists with this email"**: Email taken
- **"Token validation failed"**: Invalid or expired token
- **"Only admins can..."**: User doesn't have admin role

## Next Steps

1. **Social Authentication**: Implement Google/Apple OAuth
2. **Password Reset**: Email-based password recovery
3. **Profile Management**: User profile editing
4. **Audit Logging**: Track admin actions
5. **Two-Factor Authentication**: Extra security layer
6. **User Invitations**: Invite users to workspace

## Files Created/Modified

### Backend
- `enums/Role.java` - New
- `models/User.java` - New
- `repositories/UserRepository.java` - New
- `services/AuthService.java` - New
- `security/JwtTokenProvider.java` - New
- `controllers/AuthController.java` - New
- `controllers/AdminController.java` - New
- `config/SecurityConfig.java` - New
- `pom.xml` - Modified
- `application.properties` - Modified

### Frontend
- `types.ts` - Modified
- `services/authService.ts` - New
- `services/adminService.ts` - New
- `pages/LoginPage.tsx` - Modified
- `pages/SignupPage.tsx` - Modified
- `pages/AdminPage.tsx` - New
- `components/RequireAuth.tsx` - Modified
- `App.tsx` - Modified
