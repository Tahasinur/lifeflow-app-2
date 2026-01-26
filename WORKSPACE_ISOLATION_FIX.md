# Workspace Isolation Bug Fix

## Problem Description

When signing in from different accounts, users were accessing the same workspace instead of having separate, isolated workspaces. This was a critical data privacy issue.

## Root Cause

The bug was caused by a **missing user identification in the frontend**:

1. **Login flow didn't store user ID**: After successful authentication, [LoginPage.tsx](frontend/src/pages/LoginPage.tsx) only stored the JWT token via `authService.setToken()` but **never stored the user's ID** or other user information in localStorage.

2. **Backend requires User ID header**: The backend's [PageController.java](backend/src/main/java/com/lifeflow/backend/controller/PageController.java) filters pages using the `X-User-Id` header from requests:
   ```java
   @GetMapping
   public ResponseEntity<?> getAllPages(
           @RequestParam(required = false) String userId,
           @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
       
       String requestingUserId = headerUserId != null ? headerUserId : userId;
       return ResponseEntity.ok(repository.findByUserIdAndDeletedFalse(requestingUserId));
   }
   ```

3. **Missing header = no user filtering**: Since the frontend couldn't extract the user ID (because it was never stored), [useDashboard.ts](frontend/src/hooks/useDashboard.ts) couldn't send the required `X-User-Id` header:
   ```typescript
   const getUserId = (): string | null => {
     const storedUser = localStorage.getItem('lifeflow-user');
     if (storedUser) {
       const user = JSON.parse(storedUser);
       return user.id || null;
     }
     return null;
   };
   ```

4. **Result**: Without the `X-User-Id` header, the backend returned **all pages for all users** instead of filtering by the logged-in user.

## Solution

### Changes Made

#### 1. Store user info after login ([LoginPage.tsx](frontend/src/pages/LoginPage.tsx))
Added code to store the complete user information in localStorage after successful login:

```typescript
const response = await authService.login(email, password);
if (response.token) {
  authService.setToken(response.token);
  // Store user info in localStorage for data isolation
  localStorage.setItem('lifeflow-user', JSON.stringify({
    id: response.userId,
    email: response.email,
    name: response.name,
    role: response.role
  }));
  toast.success('Login successful!');
  navigate('/');
}
```

#### 2. Store user info after signup ([SignupPage.tsx](frontend/src/pages/SignupPage.tsx))
Applied the same fix to the registration flow to ensure new users also get their data stored properly.

#### 3. Clear user data on logout ([UserDropdown.tsx](frontend/src/components/UserDropdown.tsx))
Updated the logout handler to remove user data from localStorage:

```typescript
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('lifeflow-user');
  navigate('/login');
  toast.success('Logged out successfully');
  onClose();
};
```

### How It Works Now

1. User logs in → Backend returns JWT token + userId
2. Frontend stores both token and user info in localStorage
3. When loading pages, [useDashboard.ts](frontend/src/hooks/useDashboard.ts) reads the userId from localStorage
4. The `X-User-Id` header is now properly populated in all API requests
5. Backend correctly filters pages by the authenticated user
6. Each user sees only their own workspace

## Testing

To verify the fix works:

1. Create/Login with **Account A** → Create some pages
2. Logout
3. Create/Login with **Account B** → Create different pages
4. Logout
5. Login with **Account A** → Should see ONLY Account A's pages
6. Login with **Account B** → Should see ONLY Account B's pages

Each account should have a completely isolated workspace.

## Files Modified

- `frontend/src/pages/LoginPage.tsx` - Store user info on login
- `frontend/src/pages/SignupPage.tsx` - Store user info on signup
- `frontend/src/components/UserDropdown.tsx` - Clear user info on logout

## Security Notes

The user ID is derived from the backend and returned in the JWT response. The `userId` is a hash of the actual database UUID (`user.getId().hashCode()`) as implemented in `AuthService.java`:

```java
.userId((long) user.getId().hashCode())
```

This ensures the frontend can identify which user it is without decoding the JWT, while the backend uses the `userId` header as an additional validation layer for data isolation.
