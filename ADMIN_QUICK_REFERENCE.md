# 🔐 Admin Account - Quick Reference

## Admin Credentials

```
Email:    admin@lifeflow.com
Password: admin123
```

## Quick Start

1. **Ensure PostgreSQL is running**
   - Database: `lifeflow`
   - Host: `localhost:5432`
   - User: `postgres`
   - Password: `36349`

2. **Start the Backend**
   ```bash
   cd backend
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   
   OR
   
   ```bash
   cd backend
   ./mvnw spring-boot:run  # Linux/Mac
   mvnw.cmd spring-boot:run  # Windows
   ```

3. **Look for Confirmation Message**
   
   You should see in the logs:
   ```
   ✅ Admin user created successfully!
      Email: admin@lifeflow.com
      Password: admin123
      Role: ADMIN
   ```
   
   OR (if already exists):
   ```
   ✅ Admin user already exists
   ```

4. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Login**
   - Go to http://localhost:5000
   - Click "Login" 
   - Enter: `admin@lifeflow.com` / `admin123`
   - Click "Login"

## ✅ Everything is Configured

The admin account will be **automatically created** when the backend starts. You don't need to do anything else!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Ensure backend is running on port 8080 |
| Database error | Check PostgreSQL is running on localhost:5432 |
| Wrong password | Use exactly: `admin123` |
| User not found | Wait for backend to fully start (check logs) |

## Architecture

**Auto-creation happens here:**
```
BackendApplication.java
  └── CommandLineRunner bean
      └── AdminUserInitializer.createAdminUser()
          └── Checks for admin user
          └── Creates if missing
          └── Prints confirmation
```

**New files created:**
- `backend/src/main/java/com/lifeflow/backend/util/AdminUserInitializer.java`

**Files modified:**
- `backend/src/main/java/com/lifeflow/backend/BackendApplication.java`

## Database Details

If you need to verify in PostgreSQL:

```sql
SELECT email, role FROM users WHERE email='admin@lifeflow.com';
```

Expected result:
```
      email       | role
------------------+------
admin@lifeflow.com | ADMIN
```

---

**Status**: ✅ Admin account ready to use
**Setup**: Automatic on backend startup
**No additional setup required**
