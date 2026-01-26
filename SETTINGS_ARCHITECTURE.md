# Settings Feature - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SettingsModal Component                     │  │
│  │  ┌──────────────┬──────────────┬──────────────────────┐ │  │
│  │  │  My Account  │  Settings &  │  Teamspace Settings │ │  │
│  │  │              │  Preferences │                      │ │  │
│  │  └──────────────┴──────────────┴──────────────────────┘ │  │
│  │                                                          │  │
│  │  State Management:                                       │  │
│  │  - accountSettings, preferences, workspaceSettings      │  │
│  │  - teamspaces[], loading, error states                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│         API Calls (Fetch) ↓ ↓ ↓ ↓ ↓                            │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓ HTTP Requests
            ┌────────────────────────────────────┐
            │   HTTP://localhost:8080/api/      │
            │        settings                    │
            └──────────┬─────────────────────────┘
                       │
                       ↓ HTTP Responses
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          SettingsController                              │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Endpoints:                                         │ │  │
│  │  │ ✓ GET/PUT /account/{userId}                       │ │  │
│  │  │ ✓ GET/PUT /preferences/{userId}                   │ │  │
│  │  │ ✓ GET/PUT /workspace/{userId}                     │ │  │
│  │  │ ✓ GET/POST/PUT/DELETE /teamspaces                 │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Service/Repository Layer                               │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ UserPreferencesRepository                          │ │  │
│  │  │ WorkspaceSettingsRepository                        │ │  │
│  │  │ TeamspaceRepository                                │ │  │
│  │  │ UserRepository                                     │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Database (JPA/Hibernate)                        │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Tables:                                            │ │  │
│  │  │ • users (+ preferred_name column)                  │ │  │
│  │  │ • user_preferences                                 │ │  │
│  │  │ • workspace_settings                               │ │  │
│  │  │ • teamspaces                                       │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Load Settings (First Time)
```
User clicks Settings
        ↓
SettingsModal opens with userId
        ↓
useEffect hook triggered
        ↓
Tab changes → fetchData() called
        ↓
GET /api/settings/{type}/{userId}
        ↓
Backend checks if data exists
        ↓
No? Create defaults ← UserPreferences/WorkspaceSettings auto-created
        ↓
Return data (JSON)
        ↓
Frontend setState()
        ↓
Component re-renders with data
        ↓
User sees prefilled form
```

### 2. Update Settings
```
User modifies form input
        ↓
State updates (onChange handlers)
        ↓
User clicks "Save Changes"
        ↓
handleSave() called
        ↓
Validation check
        ↓
PUT /api/settings/{type}/{userId}
        ↓
Request body: { field: value, ... }
        ↓
Backend validates & updates record
        ↓
Return updated data
        ↓
Frontend setState() with new data
        ↓
Toast success notification
        ↓
User sees updated values
```

### 3. List Teamspaces
```
User opens Teamspace tab
        ↓
fetchTeamspaces() called
        ↓
GET /api/settings/teamspaces
        ↓
Backend returns all teamspaces []
        ↓
Frontend setState(teamspaces)
        ↓
Component renders table
        ↓
User sees all teamspaces with:
  - Name
  - Owners
  - Access level
  - Updated date
```

---

## Component Structure

```
Sidebar.tsx
├── User ID extraction (localStorage)
├── State: showSettingsModal
├── Condition: if showSettingsModal
└── Render:
    └── SettingsModal
        ├── Props:
        │   ├── isOpen: boolean
        │   ├── onClose: function
        │   └── userId: string
        │
        ├── State (by tab):
        │   ├── Account:
        │   │   ├── accountSettings (object)
        │   │   ├── preferredName (string)
        │   │   └── password, confirmPassword (string)
        │   │
        │   ├── Settings:
        │   │   ├── preferences (object)
        │   │   ├── workspaceSettings (object)
        │   │   ├── theme, language, timezone (strings)
        │   │   └── workspaceName, workspaceIcon (strings)
        │   │
        │   └── Teamspace:
        │       └── teamspaces (array)
        │
        ├── Effects:
        │   └── useEffect(() => {
        │       fetch when tab changes
        │       }, [activeTab, isOpen])
        │
        ├── Handlers:
        │   ├── handleSaveAccount()
        │   ├── handleSavePreferences()
        │   ├── handleSaveWorkspace()
        │   └── fetchTeamspaces()
        │
        └── Render:
            ├── Left Sidebar (tab nav)
            ├── Right Panel
            │   ├── Header
            │   ├── Content (based on activeTab)
            │   └── Forms with inputs
            └── Modal backdrop
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password        │
│ name            │
│ preferredName ←────┐
│ avatar          │  │
│ role            │  │
│ createdAt       │  │
│ updatedAt       │  │
└─────────────────┘  │
        │1           │
        │            │ has
        │            │
        │n           │
        ├────────────┴───────────┐
        │                        │
        │1                       │1
        │ has                    │ has
        │                        │
    ┌─────────────────────┐ ┌──────────────────────┐
    │ user_preferences    │ │ workspace_settings   │
    ├─────────────────────┤ ├──────────────────────┤
    │ id (PK)             │ │ id (PK)              │
    │ userId (FK) Unique! │ │ userId (FK) Unique!  │
    │ theme               │ │ workspaceName        │
    │ language            │ │ workspaceIcon        │
    │ spellchecker...     │ │ customLandingPage... │
    │ timezone            │ │ allowPublicAccess    │
    │ use24HourFormat     │ │ enableNotifications  │
    │ createdAt           │ │ enableEmail...       │
    │ updatedAt           │ │ createdAt            │
    │                     │ │ updatedAt            │
    └─────────────────────┘ └──────────────────────┘
                                    │1
                                    │
                                    │ configures
                                    │
                                    │n
                           ┌────────────────────┐
                           │   teamspaces       │
                           ├────────────────────┤
                           │ id (PK)            │
                           │ name               │
                           │ description        │
                           │ owners (csv ids)   │
                           │ accessLevel        │
                           │ memberIds (csv)    │
                           │ workspace..._id    │
                           │ createdAt          │
                           │ updatedAt          │
                           └────────────────────┘
```

---

## API Endpoint Tree

```
/api/settings/
├── account/{userId}
│   ├── GET  → fetch account settings
│   └── PUT  → update account settings
│
├── preferences/{userId}
│   ├── GET  → fetch user preferences (auto-create if needed)
│   └── PUT  → update preferences
│
├── workspace/{userId}
│   ├── GET  → fetch workspace settings (auto-create if needed)
│   └── PUT  → update workspace settings
│
└── teamspaces
    ├── GET              → list all teamspaces
    ├── POST             → create new teamspace
    ├── /{teamspaceId}
    │   ├── GET          → get specific teamspace
    │   ├── PUT          → update teamspace
    │   └── DELETE       → delete teamspace
    └── [by-accessLevel] → filter by access (future enhancement)
```

---

## State Management Flow

### Account Tab
```
SettingsModal state:
  accountSettings: {
    id: string,
    email: string,
    name: string,
    preferredName: string,
    avatar: string
  }

Form inputs:
  preferredName: string
  password: string
  confirmPassword: string

Handlers:
  fetchAccountSettings() → GET /api/settings/account/{userId}
  handleSaveAccount() → PUT /api/settings/account/{userId}
```

### Settings Tab
```
SettingsModal state:
  preferences: {
    id, userId, theme, language,
    spellcheckerLanguages, timezone, use24HourFormat
  }
  
  workspaceSettings: {
    id, userId, workspaceName, workspaceIcon,
    customLandingPageJson, allowPublicAccess,
    enableNotifications, enableEmailNotifications
  }

Form inputs:
  theme: "light" | "dark" | "auto"
  language: string (en, es, fr, etc.)
  spellcheckerLanguages: string
  timezone: string
  workspaceName: string
  workspaceIcon: string

Handlers:
  fetchPreferences() → GET /api/settings/preferences/{userId}
  fetchWorkspaceSettings() → GET /api/settings/workspace/{userId}
  handleSavePreferences() → PUT /api/settings/preferences/{userId}
  handleSaveWorkspace() → PUT /api/settings/workspace/{userId}
```

### Teamspace Tab
```
SettingsModal state:
  teamspaces: [{
    id, name, description,
    owners, accessLevel, memberIds, updatedAt
  }, ...]

Table columns:
  - Teamspace (name)
  - Owners (owners string)
  - Access (accessLevel with color)
  - Updated (formatted date)

Handlers:
  fetchTeamspaces() → GET /api/settings/teamspaces
```

---

## Request/Response Cycle

### Example: Save Workspace Settings

**Frontend Request:**
```
PUT /api/settings/workspace/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
{
  "workspaceName": "Team Workspace",
  "workspaceIcon": "👥",
  "customLandingPageJson": null,
  "allowPublicAccess": false,
  "enableNotifications": true,
  "enableEmailNotifications": true
}
```

**Backend Processing:**
```
1. SettingsController.updateWorkspaceSettings()
   ├── Validate userId exists
   ├── Find WorkspaceSettings by userId
   ├── OR create new if not found
   ├── Update fields from DTO
   ├── Save to database
   └── Convert to DTO
2. Return 200 OK
```

**Backend Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceName": "Team Workspace",
  "workspaceIcon": "👥",
  "customLandingPageJson": null,
  "allowPublicAccess": false,
  "enableNotifications": true,
  "enableEmailNotifications": true
}
```

**Frontend Processing:**
```
1. Response received
2. .json() → parse JSON
3. Update state: setWorkspaceSettings(data)
4. Show toast: "Workspace settings saved"
5. Component re-renders with new values
```

---

## Error Handling Flow

```
User clicks Save
    ↓
try {
    ↓
  setLoading(true)
    ↓
  fetch(endpoint, options)
    ↓
  if (!response.ok) throw error
    ↓
  const data = response.json()
    ↓
  setState(data)
    ↓
  toast.success('Saved!')
}
catch (error) {
    ↓
    toast.error('Failed to save')
}
finally {
    ↓
    setLoading(false)
}
```

---

## Database Query Patterns

### Get or Create (Preferences/Workspace)
```sql
SELECT * FROM user_preferences WHERE user_id = ?
↓
If not found:
  INSERT INTO user_preferences (user_id, theme, language, ...)
  VALUES (?, 'light', 'en', ...)
↓
Return data
```

### Get Teamspaces
```sql
SELECT * FROM teamspaces
ORDER BY updated_at DESC
↓
Return array
```

### Update Teamspace
```sql
UPDATE teamspaces 
SET name = ?, description = ?, owners = ?, 
    access_level = ?, member_ids = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
↓
Return updated record
```

---

## Performance Characteristics

| Operation | Query Type | Performance | Notes |
|-----------|-----------|-------------|-------|
| Get Account | Single SELECT | O(1) Fast | By user ID |
| Get Preferences | SELECT + INSERT | O(1) Fast | Auto-create |
| Get Workspace | SELECT + INSERT | O(1) Fast | Auto-create |
| List Teamspaces | SELECT all | O(n) | ~1ms for 100 records |
| Update Any | UPDATE | O(1) Fast | Direct ID lookup |
| Delete Teamspace | DELETE | O(1) Fast | Direct ID lookup |

**Database Indexes Recommended:**
- `users.id` (primary key)
- `user_preferences.user_id` (unique)
- `workspace_settings.user_id` (unique)
- `teamspaces.id` (primary key)
- `teamspaces.updated_at` (for sorting)

---

## Sequence Diagrams

### User Opens Settings (First Time)
```
User                 Frontend              Backend              Database
  │                      │                    │                    │
  ├─ Click Settings ──→  │                    │                    │
  │                      │                    │                    │
  │                      │── GET Preferences ─→│                    │
  │                      │                    ├─ Query user_pref. ─→│
  │                      │                    │← Not found         │
  │                      │                    │                    │
  │                      │                    │── INSERT defaults ─→│
  │                      │                    │← Success           │
  │                      │← Return data ──────┤                    │
  │                      │                    │                    │
  │← Show Preferences ──│                    │                    │
  │                      │                    │                    │
```

### Update and Save
```
User                 Frontend              Backend              Database
  │                      │                    │                    │
  ├─ Change name ──→    │ setState()          │                    │
  │                      │                    │                    │
  ├─ Click Save ──→     │── PUT with data ───→│                    │
  │                      │                    ├─ Validate ─────────│
  │                      │                    ├─ UPDATE ──────────→│
  │                      │                    │← Success           │
  │                      │← Return updated ───┤                    │
  │                      │ data               │                    │
  │← Show success ──┤    │                    │                    │
  │   toast         │                        │                    │
  │                      │                    │                    │
```

---

## Summary

The settings feature follows a clean, layered architecture:
- **Frontend:** React component with state management
- **API:** RESTful endpoints with JSON payloads
- **Backend:** Spring controllers, repositories, models
- **Database:** JPA/Hibernate with auto-schema generation

Data flows efficiently with proper error handling, loading states, and user feedback at every step.
