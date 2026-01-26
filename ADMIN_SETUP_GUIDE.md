# Admin Account Setup Guide

## ✅ Admin Account Created

An admin account has been automatically configured to be created when the Lifeflow backend starts up.

### Admin Credentials

```
Email: admin@lifeflow.com
Password: admin123
Role: ADMIN
```

## How to Access the Admin Account

### Step 1: Start the Backend Server

The admin user will be automatically created when the backend starts. Make sure your PostgreSQL database is running.

**Using Docker (if available):**
```bash
docker-compose up -d  # If docker-compose.yml is configured
```

**Using Maven (if Maven is installed):**
```bash
cd backend
./mvnw spring-boot:run
# Or on Windows:
mvnw.cmd spring-boot:run
```

**Using the JAR (after building):**
```bash
cd backend
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Step 2: Log in with Admin Account

1. Open the Lifeflow application in your browser
2. Go to the Login page
3. Enter the following credentials:
   - **Email**: `admin@lifeflow.com`
   - **Password**: `admin123`
4. Click Login

### Step 3: Access Admin Features

Once logged in as admin, you'll have access to:
- Admin panel
- User management
- System settings
- Analytics and reporting

## Verification

### Check if Admin User Was Created

When the backend starts, you should see one of these messages in the console:

```
✅ Admin user created successfully!
   Email: admin@lifeflow.com
   Password: admin123
   Role: ADMIN
```

OR

```
✅ Admin user already exists
```

If you see this message, the admin account is ready to use.

## Database Verification (Optional)

If you want to verify the admin user exists in the database directly:

### Using PostgreSQL Command Line:
```bash
psql -U postgres -d lifeflow -c "SELECT email, role FROM users WHERE email='admin@lifeflow.com';"
```

Expected output:
```
      email       | role
------------------+------
admin@lifeflow.com | ADMIN
```

## Troubleshooting

### Issue: "Admin user already exists" appears but can't log in

**Solution**: The admin user exists in the database. Try logging in with:
- Email: `admin@lifeflow.com`
- Password: `admin123`

If it still doesn't work, check that:
1. The backend is running on port 8080
2. The frontend is pointing to the correct backend URL
3. The database connection is working

### Issue: Backend doesn't start

**Possible causes:**
- PostgreSQL database is not running
- Database credentials are incorrect in `application.properties`
- Port 8080 is already in use

**Solutions:**
1. Check PostgreSQL is running
2. Verify database credentials:
   ```
   spring.datasource.url=jdbc:postgresql://localhost:5432/lifeflow
   spring.datasource.username=postgres
   spring.datasource.password=36349
   ```
3. Change the port in `application.properties` if needed:
   ```
   server.port=8080
   ```

### Issue: "Invalid email or password" on login

**Possible causes:**
- Email/password typo
- Admin user wasn't created (check backend logs)
- Database not properly initialized

**Solutions:**
1. Double-check credentials are exact:
   - Email: `admin@lifeflow.com` (lowercase)
   - Password: `admin123`
2. Check backend logs for initialization messages
3. Restart the backend to ensure user creation

## Changing Admin Password (After Login)

Once logged in as admin, you can change the password through the user profile settings.

## Creating Additional Admin Accounts

You can create additional admin accounts through:

### Option 1: Using the API

Send a POST request to `/api/auth/register`:
```json
{
  "email": "admin2@lifeflow.com",
  "password": "SecurePassword123",
  "name": "Admin Two"
}
```

Then update the role to ADMIN in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin2@lifeflow.com';
```

### Option 2: Directly in Database

```sql
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  'unique-id-here',
  'another-admin@lifeflow.com',
  '$2a$10$slYQmyNdGzin7olVH0p1Be4DlH.PKZbv5H8KnzzVgXXbVxzy990qm',
  'Another Admin',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

**Note**: The password hash is for "admin123". For different passwords, use an online bcrypt encoder or generate one in Java.

## Architecture Details

### How Admin User Auto-Creation Works

1. **File**: `BackendApplication.java`
2. **Method**: `initializeAdminUser()` - CommandLineRunner bean
3. **Utility**: `AdminUserInitializer.createAdminUser()`
4. **Timing**: Runs when the Spring Boot application starts

### Code Flow

```
Application Start
    ↓
Spring Boot Initialization
    ↓
CommandLineRunner Bean Execution
    ↓
AdminUserInitializer.createAdminUser()
    ↓
Check if admin@lifeflow.com exists
    ↓
If NOT exists:
  - Create User with ADMIN role
  - Hash password with BCrypt
  - Save to database
  - Print confirmation message
    ↓
If EXISTS:
  - Print "Admin user already exists" message
    ↓
Application Ready
```

## Files Modified/Created

**Modified Files:**
- `backend/src/main/java/com/lifeflow/backend/BackendApplication.java`

**Created Files:**
- `backend/src/main/java/com/lifeflow/backend/util/AdminUserInitializer.java`
- `backend/init-admin.sql` (alternative SQL approach)

## Summary

✅ Admin account auto-creation is now enabled
✅ Admin will be created automatically on first startup
✅ Credentials: admin@lifeflow.com / admin123
✅ No manual setup required (other than starting the backend)
✅ Can verify in database or through login

## Next Steps

1. Make sure PostgreSQL is running
2. Start the backend server
3. Wait for "Admin user created successfully" message
4. Navigate to login page in the frontend
5. Log in with admin@lifeflow.com / admin123
6. Enjoy! You now have full admin access
