# Settings Feature Implementation - Complete Guide

## Overview
A fully backend-enabled settings feature has been implemented with three main sections:
1. **My Account** - Account and security settings
2. **Settings** - Workspace settings and user preferences
3. **Teamspace Settings** - Manage all teamspaces

---

## Backend Implementation

### Models Created

#### 1. **UserPreferences** (`UserPreferences.java`)
Stores user-specific preferences like language, theme, and spellchecker settings.

**Fields:**
- `userId` (String, unique) - Reference to user
- `theme` (String) - "light", "dark", "auto"
- `language` (String) - Language code (en, es, fr, etc.)
- `spellcheckerLanguages` (String) - Comma-separated language codes
- `timezone` (String) - User's timezone
- `use24HourFormat` (Boolean) - Time format preference

#### 2. **WorkspaceSettings** (`WorkspaceSettings.java`)
Stores workspace configuration for each user.

**Fields:**
- `userId` (String, unique) - Reference to user
- `workspaceName` (String) - Name of the workspace
- `workspaceIcon` (String) - Emoji or image URL
- `customLandingPageJson` (String) - Custom landing page template
- `allowPublicAccess` (Boolean) - Public access toggle
- `enableNotifications` (Boolean) - Notifications setting
- `enableEmailNotifications` (Boolean) - Email notifications setting

#### 3. **Teamspace** (`Teamspace.java`)
Represents a teamspace with members and access control.

**Fields:**
- `name` (String) - Teamspace name
- `description` (String) - Teamspace description
- `owners` (String) - Comma-separated owner IDs
- `accessLevel` (String) - "public", "private", "restricted"
- `memberIds` (String) - Comma-separated member IDs
- `workspaceSettingsId` (String) - Associated workspace settings

#### 4. **User Model Update**
Added `preferredName` field to existing User model:
```java
private String preferredName;  // How the user wants to be addressed
```

### Repositories

1. **UserPreferencesRepository** - CRUD operations for user preferences
2. **WorkspaceSettingsRepository** - CRUD operations for workspace settings
3. **TeamspaceRepository** - CRUD operations for teamspaces

### DTOs (Data Transfer Objects)

1. **AccountSettingsDTO** - For account info (email, name, preferredName, avatar)
2. **UserPreferencesDTO** - For user preferences
3. **WorkspaceSettingsDTO** - For workspace configuration
4. **TeamspaceDTO** - For teamspace information

### REST API Endpoints

#### Account Settings
- `GET /api/settings/account/{userId}` - Get account settings
- `PUT /api/settings/account/{userId}` - Update account settings

#### User Preferences
- `GET /api/settings/preferences/{userId}` - Get user preferences
- `PUT /api/settings/preferences/{userId}` - Update preferences

#### Workspace Settings
- `GET /api/settings/workspace/{userId}` - Get workspace settings
- `PUT /api/settings/workspace/{userId}` - Update workspace settings

#### Teamspace Management
- `GET /api/settings/teamspaces` - List all teamspaces
- `GET /api/settings/teamspaces/{teamspaceId}` - Get specific teamspace
- `POST /api/settings/teamspaces` - Create new teamspace
- `PUT /api/settings/teamspaces/{teamspaceId}` - Update teamspace
- `DELETE /api/settings/teamspaces/{teamspaceId}` - Delete teamspace

---

## Frontend Implementation

### SettingsModal Component (`SettingsModal.tsx`)

A comprehensive modal with three tabs:

#### 1. **My Account Tab**
**Account Section:**
- Preferred Name input field
- Auto-saves to backend
- Description: "This is how your name will appear to other users"

**Account Security Section:**
- Email (read-only, disabled field)
- Password input
- Confirm Password input
- Update Password button
- Info text: "Your email address cannot be changed through settings"

#### 2. **Settings Tab**
**Workspace Settings Section:**
- Workspace Name (text input)
- Icon (emoji picker/upload button)
  - Description: "Upload an image or pick an emoji. It will show up in your sidebar and notifications."
- Custom Landing Page (button to configure)
  - Description: "When a new workspace member joins, a copy of this page will automatically be installed in their Private section."

**Preferences Section:**
- **Appearance Subsection:**
  - Dark Mode toggle
  - Customize how Lifeflow looks on your device

- **Language & Time Subsection:**
  - Language dropdown (en, es, fr, de, ja, zh)
    - Description: "Change the language used in the user interface."
  - Timezone dropdown (UTC, EST, CST, MST, PST, GMT, CET, IST, JST, AEST)
  - Spellchecker Languages dropdown
    - Description: "Change the languages used by the spellchecker."

#### 3. **Teamspace Settings Tab**
A table displaying all teamspaces with:

**Table Columns:**
- **Teamspace** - Name of the teamspace
- **Owners** - Owner IDs (badge style)
- **Access** - Access level (public/private, color-coded)
- **Updated** - Last update date

**Features:**
- Hover effects for better UX
- Color-coded access levels (blue for public, gray for private)
- Formatted dates
- Empty state message if no teamspaces

### Features

1. **API Integration**
   - Automatically fetches settings from backend when tab opens
   - Debounced API calls on tab changes
   - Error handling with toast notifications
   - Loading states with spinner

2. **Data Persistence**
   - Auto-save on form changes
   - Success/error notifications via toast
   - Form validation before submission

3. **Theme Support**
   - Dark/light mode compatible
   - Consistent styling across all sections
   - Accessible color contrasts

4. **User Experience**
   - Responsive layout
   - Clear section headers
   - Descriptive help text
   - Disabled/read-only states where appropriate
   - Loading indicators

---

## Integration Points

### User Identification
- `userId` extracted from localStorage (`lifeflow-user` object)
- Passed from Sidebar → SettingsModal
- Used for all API calls

### Data Flow
1. User clicks "Settings" in user dropdown
2. SettingsModal opens with userId
3. When tab changes, respective API is called
4. Data is loaded and displayed
5. User makes changes
6. Save button calls PUT endpoint
7. Success toast shown on completion

---

## Database Schema (Auto-created by JPA)

```sql
-- user_preferences
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  theme VARCHAR(20) NOT NULL DEFAULT 'light',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  spellchecker_languages TEXT,
  timezone VARCHAR(30) DEFAULT 'UTC',
  use_24_hour_format BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- workspace_settings
CREATE TABLE workspace_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  workspace_name VARCHAR(255) NOT NULL,
  workspace_icon VARCHAR(255),
  custom_landing_page_json TEXT,
  allow_public_access BOOLEAN DEFAULT FALSE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- teamspaces
CREATE TABLE teamspaces (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owners VARCHAR(500) NOT NULL,
  access_level VARCHAR(50) NOT NULL DEFAULT 'private',
  member_ids TEXT,
  workspace_settings_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated users table
ALTER TABLE users ADD COLUMN preferred_name VARCHAR(255);
```

---

## API Response Examples

### Get Account Settings
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "preferredName": "John",
  "avatar": "avatar-url"
}
```

### Get Preferences
```json
{
  "id": "pref-456",
  "userId": "user-123",
  "theme": "dark",
  "language": "en",
  "spellcheckerLanguages": "en,es",
  "timezone": "EST",
  "use24HourFormat": false
}
```

### Get Workspace Settings
```json
{
  "id": "ws-789",
  "userId": "user-123",
  "workspaceName": "John's Workspace",
  "workspaceIcon": "📓",
  "customLandingPageJson": null,
  "allowPublicAccess": false,
  "enableNotifications": true,
  "enableEmailNotifications": true
}
```

### Get Teamspaces
```json
[
  {
    "id": "ts-001",
    "name": "Product Team",
    "description": "Main product development",
    "owners": "user-123,user-456",
    "accessLevel": "private",
    "memberIds": "user-123,user-456,user-789",
    "updatedAt": "2026-01-26T20:30:00Z"
  }
]
```

---

## File Locations

### Backend Files
- Models: `src/main/java/com/lifeflow/backend/model/`
  - `UserPreferences.java`
  - `WorkspaceSettings.java`
  - `Teamspace.java`
- Repositories: `src/main/java/com/lifeflow/backend/repository/`
- Controllers: `src/main/java/com/lifeflow/backend/controller/SettingsController.java`
- DTOs: `src/main/java/com/lifeflow/backend/dto/`

### Frontend Files
- `frontend/src/components/SettingsModal.tsx` - Main settings component
- `frontend/src/components/Sidebar.tsx` - Updated to pass userId

---

## Testing the Implementation

### Manual Testing Steps

1. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow**
   - Login to application
   - Click workspace name → "Settings"
   - Test each tab:
     - My Account: Update preferred name, verify API call
     - Settings: Update workspace name/icon, change language
     - Teamspace Settings: View teamspaces table

4. **Verify API Calls**
   - Open browser DevTools → Network tab
   - Check that API endpoints are called correctly
   - Verify response data matches frontend

---

## Future Enhancements

1. **File Upload** - For workspace icon and landing page templates
2. **More Languages** - Add additional language options
3. **Invite System** - Invite members to teamspace
4. **Role Management** - Advanced permission controls
5. **Audit Logs** - Track settings changes
6. **Notifications** - Notify users of setting changes
7. **Templates** - Pre-built landing page templates

---

## Troubleshooting

### Settings Not Loading
- Check browser console for errors
- Verify userId is present in localStorage
- Ensure backend API is running on correct port

### API Errors
- Check CORS settings if getting 403
- Verify user exists in database
- Check backend logs for detailed error messages

### Data Not Persisting
- Verify database connection is working
- Check that PUT endpoint is being called (DevTools Network)
- Look for validation errors in response

---

## Notes

- All settings default to reasonable values if not previously set
- Teamspace list is global (not filtered by user) - update as needed
- Theme changes should sync with global theme hook
- Password changes require confirmation match
- Email cannot be changed from settings (security)
