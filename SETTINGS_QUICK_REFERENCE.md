# Settings Feature - Quick Reference

## Three Main Tabs

### 1️⃣ My Account
```
┌─────────────────────────────────┐
│ ACCOUNT                         │
├─────────────────────────────────┤
│ Preferred Name: [___________]   │
│ "This is how your name will     │
│  appear to other users"         │
│ [Save Changes]                  │
│                                 │
│ ACCOUNT SECURITY                │
├─────────────────────────────────┤
│ Email: user@example.com [x]     │
│ (Read-only)                     │
│                                 │
│ Password: [___________]         │
│ Confirm: [___________]          │
│ [Update Password]               │
└─────────────────────────────────┘
```

**What it stores:**
- `preferredName` - How they want to be called
- `email` - Their account email (view-only)
- `password` - Hashed in database

**API Endpoints:**
- `GET /api/settings/account/{userId}`
- `PUT /api/settings/account/{userId}`

---

### 2️⃣ Settings
```
┌──────────────────────────────────┐
│ WORKSPACE SETTINGS               │
├──────────────────────────────────┤
│ Workspace Name: [_____________]  │
│                                  │
│ Icon:  [📓] [Upload or pick]    │
│ "Shows in sidebar & notif."      │
│                                  │
│ Custom Landing Page:             │
│ [Configure Landing Page]         │
│ "Auto-installed for new members" │
│ [Save Changes]                   │
│                                  │
│ PREFERENCES                      │
├──────────────────────────────────┤
│ APPEARANCE                       │
│ 🌙 Dark Mode [Toggle]           │
│ "Customize how Lifeflow looks"   │
│                                  │
│ LANGUAGE & TIME                  │
├──────────────────────────────────┤
│ Language: [English ▼]           │
│ "Change UI language"             │
│                                  │
│ Timezone: [UTC ▼]               │
│                                  │
│ Spellchecker: [English ▼]       │
│ "Change spellchecker language"   │
│ [Save Preferences]               │
└──────────────────────────────────┘
```

**What it stores:**
- `workspaceName` - Workspace name
- `workspaceIcon` - Emoji or image URL
- `customLandingPageJson` - Landing page template
- `theme` - UI theme (light/dark)
- `language` - UI language (en, es, fr, etc.)
- `spellcheckerLanguages` - Spell check languages
- `timezone` - User's timezone

**API Endpoints:**
- `GET /api/settings/workspace/{userId}`
- `PUT /api/settings/workspace/{userId}`
- `GET /api/settings/preferences/{userId}`
- `PUT /api/settings/preferences/{userId}`

---

### 3️⃣ Teamspace Settings
```
┌─────────────────────────────────────────────────┐
│ MANAGE TEAMSPACES                               │
│ "All teamspaces you have access to"             │
├──────┬──────────┬──────────┬────────────────────┤
│Team  │ Owners   │ Access   │ Updated            │
├──────┼──────────┼──────────┼────────────────────┤
│Prod  │[user-123]│ private  │ Jan 26, 2026       │
│Team  │[user-456]│ public   │ Jan 25, 2026       │
│Data  │[user-789]│ private  │ Jan 24, 2026       │
└──────┴──────────┴──────────┴────────────────────┘
```

**Table Shows:**
- Teamspace name
- Owner IDs (badge)
- Access level (colored: blue=public, gray=private)
- Last updated date

**API Endpoints:**
- `GET /api/settings/teamspaces` - List all
- `GET /api/settings/teamspaces/{teamspaceId}` - Get one
- `POST /api/settings/teamspaces` - Create
- `PUT /api/settings/teamspaces/{teamspaceId}` - Update
- `DELETE /api/settings/teamspaces/{teamspaceId}` - Delete

---

## Data Models at a Glance

### User (Extended)
```java
String id              // UUID
String email           // user@example.com
String password        // Hashed
String name            // Full name
String preferredName   // How they want to be called ✨ NEW
String avatar          // Profile picture URL
```

### UserPreferences
```java
String id                       // UUID
String userId                   // Foreign key to User
String theme                    // "light" | "dark" | "auto"
String language                 // "en" | "es" | "fr" | ...
String spellcheckerLanguages    // "en,es,fr"
String timezone                 // "UTC" | "EST" | ...
boolean use24HourFormat         // true/false
```

### WorkspaceSettings
```java
String id                       // UUID
String userId                   // Foreign key to User (unique)
String workspaceName            // Workspace name
String workspaceIcon            // "📓" or image URL
String customLandingPageJson    // Template JSON
boolean allowPublicAccess       // Share publicly?
boolean enableNotifications     // Show notifications?
boolean enableEmailNotifications// Email notifications?
```

### Teamspace
```java
String id                       // UUID
String name                     // Team name
String description              // Team description
String owners                   // "user-123,user-456"
String accessLevel              // "public" | "private" | "restricted"
String memberIds                // "user-123,user-456,user-789"
String workspaceSettingsId      // Link to workspace
```

---

## Frontend Component Structure

### SettingsModal.tsx Props
```tsx
interface SettingsModalProps {
  isOpen: boolean;           // Modal open/close
  onClose: () => void;       // Close handler
  userId?: string;           // Current user ID
}
```

### Tab Types
```tsx
type TabType = 'account' | 'settings' | 'teamspace';
```

### Key Features
✅ Auto-fetch data when tab opens
✅ Save button for each section
✅ Loading state with spinner
✅ Toast notifications (success/error)
✅ Dark mode support
✅ Form validation
✅ Responsive design

---

## Common Tasks

### Add a New Setting
1. Add field to appropriate model (UserPreferences, WorkspaceSettings)
2. Add to corresponding DTO
3. Update controller PUT endpoint
4. Add input field to frontend
5. Update state and API call

### Update Teamspace
```java
PUT /api/settings/teamspaces/{teamspaceId}
{
  "name": "New Name",
  "owners": "user-123",
  "accessLevel": "public",
  "memberIds": "user-123,user-456"
}
```

### Get User's Preferences
```java
GET /api/settings/preferences/{userId}
→ Creates defaults if not found
```

---

## Default Values

| Setting | Default |
|---------|---------|
| theme | "light" |
| language | "en" |
| timezone | "UTC" |
| use24HourFormat | false |
| workspaceIcon | "📓" |
| allowPublicAccess | false |
| enableNotifications | true |
| enableEmailNotifications | true |

---

## Files Summary

| File | Purpose | Type |
|------|---------|------|
| UserPreferences.java | User prefs model | Backend |
| WorkspaceSettings.java | Workspace config | Backend |
| Teamspace.java | Teamspace model | Backend |
| SettingsController.java | REST endpoints | Backend |
| AccountSettingsDTO.java | DTO | Backend |
| UserPreferencesDTO.java | DTO | Backend |
| WorkspaceSettingsDTO.java | DTO | Backend |
| TeamspaceDTO.java | DTO | Backend |
| SettingsModal.tsx | UI component | Frontend |
| Sidebar.tsx | Updated to pass userId | Frontend |

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| userId not found | No localStorage data | Ensure user is logged in |
| 404 on API call | User doesn't exist | Create user first |
| Save fails silently | Server error | Check backend logs |
| Data not updating | Wrong endpoint | Verify API URL |
| Theme not changing | Hook not updated | Check useTheme hook integration |

---

## Testing Checklist

- [ ] Account settings load correctly
- [ ] Preferred name saves
- [ ] Password fields show
- [ ] Workspace name updates
- [ ] Workspace icon displays
- [ ] Language dropdown works
- [ ] Timezone selection works
- [ ] Teamspace table appears
- [ ] All tabs switch smoothly
- [ ] Dark mode works
- [ ] Toast notifications show
- [ ] Loading spinner displays
- [ ] Error messages appear

---

## Important Notes

⚠️ **User ID Required** - Always get userId from localStorage
⚠️ **Email Read-Only** - Cannot be changed from settings
⚠️ **Password Confirmation** - Must match to submit
⚠️ **Defaults Created** - Prefs/workspace created automatically
⚠️ **Teamspace Global** - Not yet filtered by user access
⚠️ **API Base URL** - Currently `http://localhost:8080/api`

---

## Quick Links

- Backend: `backend/src/main/java/com/lifeflow/backend/`
- Frontend: `frontend/src/components/SettingsModal.tsx`
- Full Docs: `SETTINGS_FEATURE_IMPLEMENTATION.md`
