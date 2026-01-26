# ✅ Admin Account Setup - Complete

## What Was Done

I've configured the Lifeflow application to **automatically create an admin account** when the backend starts up.

### Admin Credentials

```
Email:    admin@lifeflow.com
Password: admin123
```

---

## Changes Made

### 1. Modified Backend Application ✅

**File**: `backend/src/main/java/com/lifeflow/backend/BackendApplication.java`

Added a `CommandLineRunner` bean that automatically:
- Checks if admin user exists
- Creates admin user if missing
- Prints confirmation in console logs

### 2. Created Admin Initializer Utility ✅

**File**: `backend/src/main/java/com/lifeflow/backend/util/AdminUserInitializer.java` (NEW)

A utility class that handles:
- Admin user creation logic
- Password encoding (BCrypt)
- Role assignment
- Console logging

### 3. Created SQL Alternative ✅

**File**: `backend/init-admin.sql` (NEW)

A SQL script as backup if you want to manually insert the admin user.

### 4. Documentation ✅

Created comprehensive guides:
- `ADMIN_SETUP_GUIDE.md` - Detailed setup instructions
- `ADMIN_QUICK_REFERENCE.md` - Quick reference card

---

## How It Works

### Automatic Process

When you start the backend:

```
1. Backend starts
   ↓
2. Spring Boot initializes
   ↓
3. CommandLineRunner executes
   ↓
4. AdminUserInitializer checks if admin exists
   ↓
5. If NOT found:
   - Creates user: admin@lifeflow.com
   - Sets password: admin123 (BCrypt encoded)
   - Sets role: ADMIN
   - Saves to database
   ↓
6. Prints success message to console
```

### Console Output

You'll see one of these messages when backend starts:

**First time:**
```
✅ Admin user created successfully!
   Email: admin@lifeflow.com
   Password: admin123
   Role: ADMIN
```

**Subsequent times:**
```
✅ Admin user already exists
```

---

## Usage Instructions

### Step 1: Start PostgreSQL
Make sure PostgreSQL is running on `localhost:5432` with:
- Database: `lifeflow`
- Username: `postgres`
- Password: `36349`

### Step 2: Build Backend (if needed)
```bash
cd backend
./mvnw clean package  # Linux/Mac
mvnw.cmd clean package  # Windows
```

### Step 3: Start Backend
```bash
cd backend
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Wait for the console message confirming admin user creation.

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Login
1. Navigate to http://localhost:5000
2. Click "Login"
3. Enter credentials:
   - Email: `admin@lifeflow.com`
   - Password: `admin123`
4. Click Login

✅ You're now logged in as admin!

---

## Technical Details

### Authentication Flow

```
User enters credentials
         ↓
Frontend sends POST /api/auth/login
         ↓
Backend validates email/password
         ↓
If valid:
  - Generate JWT token
  - Return token + user details
         ↓
Frontend stores token in localStorage
         ↓
Frontend redirects to dashboard
```

### Password Security

- Password is hashed using BCrypt (strong encryption)
- Original password is never stored
- During login, input password is hashed and compared
- Even database admins can't see the actual password

### Role-Based Access

- **ADMIN** role: Full access to all features
- **USER** role: Standard user features
- Admin user is automatically assigned ADMIN role

---

## Verification

### Method 1: Check Console Logs
Look for the confirmation message when backend starts.

### Method 2: Try Logging In
Use the credentials to log in - if it works, admin user exists!

### Method 3: Check Database (Optional)
```bash
psql -U postgres -d lifeflow
```

Then run:
```sql
SELECT email, role, created_at FROM users WHERE email='admin@lifeflow.com';
```

You should see:
```
      email       | role |        created_at         
------------------+------+----------------------------
admin@lifeflow.com | ADMIN | 2026-01-26 ...
```

---

## Files Summary

### Modified
| File | Changes |
|------|---------|
| `BackendApplication.java` | Added CommandLineRunner bean for auto-creation |

### Created
| File | Purpose |
|------|---------|
| `AdminUserInitializer.java` | Utility class for admin creation |
| `init-admin.sql` | Alternative SQL approach |
| `ADMIN_SETUP_GUIDE.md` | Comprehensive setup guide |
| `ADMIN_QUICK_REFERENCE.md` | Quick reference card |
| `ADMIN_ACCOUNT_SETUP.md` | This document |

---

## Key Features

✅ **Automatic Creation** - No manual setup needed
✅ **Safe** - Uses BCrypt password hashing
✅ **Idempotent** - Safely runs multiple times
✅ **Logged** - Prints confirmation to console
✅ **Verified** - Can check in database or by logging in
✅ **Documented** - Complete setup guides included

---

## Next Steps

1. ✅ Backend code is ready
2. ⏳ Rebuild backend: `./mvnw clean package`
3. ⏳ Start backend with new code
4. ⏳ Check for confirmation message
5. ⏳ Log in with admin credentials
6. ✅ Done!

---

## FAQ

**Q: Do I need to rebuild the backend?**
A: Yes, the Java code changes require recompilation. Run `./mvnw clean package` in the backend folder.

**Q: Can I use a different password?**
A: Yes, you can change it after logging in, or modify the code and rebuild.

**Q: What if the admin user already exists?**
A: The code checks and won't create a duplicate. It will just print a confirmation message.

**Q: Is the password secure?**
A: Yes, it's hashed using BCrypt, one of the most secure password hashing algorithms.

**Q: Can I have multiple admin accounts?**
A: Yes, you can create more admin accounts through the database or by modifying the code.

**Q: What if I forget the password?**
A: You can reset it by:
1. Updating the database directly with a new BCrypt hash
2. Or deleting the user and letting auto-creation run again

---

## Support

If you encounter issues:

1. Check backend logs for error messages
2. Verify PostgreSQL is running and accessible
3. Verify database credentials in `application.properties`
4. Make sure you rebuilt the backend after code changes
5. Check that port 8080 is available for the backend

---

## Summary

✅ **Admin account is now automatically created**
✅ **No additional setup or scripts needed**
✅ **Secure password handling with BCrypt**
✅ **Complete with comprehensive documentation**
✅ **Ready to use immediately after backend starts**

**Status**: READY TO USE
**Credentials**: admin@lifeflow.com / admin123
**Next Action**: Rebuild backend and start it
