# Settings API - Testing & Examples

## Base URL
```
http://localhost:8080/api/settings
```

---

## Account Settings

### Get Account Settings
```bash
GET /api/settings/account/{userId}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/settings/account/550e8400-e29b-41d4-a716-446655440000
```

**Example Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "preferredName": "Johnny",
  "avatar": "https://example.com/avatars/john.jpg"
}
```

### Update Account Settings
```bash
PUT /api/settings/account/{userId}
Content-Type: application/json
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/settings/account/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "preferredName": "John",
    "name": "John Doe",
    "avatar": "https://example.com/avatars/john-v2.jpg"
  }'
```

**Example Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "preferredName": "John",
  "avatar": "https://example.com/avatars/john-v2.jpg"
}
```

**Response (404):**
```json
{}
```

---

## User Preferences

### Get Preferences
```bash
GET /api/settings/preferences/{userId}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/settings/preferences/550e8400-e29b-41d4-a716-446655440000
```

**Example Response (200) - First Call (Auto-Creates Defaults):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "light",
  "language": "en",
  "spellcheckerLanguages": "en",
  "timezone": "UTC",
  "use24HourFormat": false
}
```

**Example Response (200) - Subsequent Calls:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "dark",
  "language": "es",
  "spellcheckerLanguages": "en,es,fr",
  "timezone": "EST",
  "use24HourFormat": true
}
```

### Update Preferences
```bash
PUT /api/settings/preferences/{userId}
Content-Type: application/json
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/settings/preferences/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "language": "es",
    "spellcheckerLanguages": "en,es,fr",
    "timezone": "EST",
    "use24HourFormat": true
  }'
```

**Example Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "dark",
  "language": "es",
  "spellcheckerLanguages": "en,es,fr",
  "timezone": "EST",
  "use24HourFormat": true
}
```

---

## Workspace Settings

### Get Workspace Settings
```bash
GET /api/settings/workspace/{userId}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/settings/workspace/550e8400-e29b-41d4-a716-446655440000
```

**Example Response (200) - First Call (Auto-Creates Defaults):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceName": "John Doe's Workspace",
  "workspaceIcon": "📓",
  "customLandingPageJson": null,
  "allowPublicAccess": false,
  "enableNotifications": true,
  "enableEmailNotifications": true
}
```

**Example Response (200) - With Customization:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "workspaceName": "My Creative Space",
  "workspaceIcon": "🎨",
  "customLandingPageJson": "{\"title\":\"Welcome\",\"content\":\"...\"}}",
  "allowPublicAccess": true,
  "enableNotifications": true,
  "enableEmailNotifications": false
}
```

### Update Workspace Settings
```bash
PUT /api/settings/workspace/{userId}
Content-Type: application/json
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/settings/workspace/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceName": "Team Workspace",
    "workspaceIcon": "👥",
    "customLandingPageJson": null,
    "allowPublicAccess": false,
    "enableNotifications": true,
    "enableEmailNotifications": true
  }'
```

**Example Response (200):**
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

---

## Teamspace Settings

### List All Teamspaces
```bash
GET /api/settings/teamspaces
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/settings/teamspaces
```

**Example Response (200):**
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Product Team",
    "description": "Main product development",
    "owners": "550e8400-e29b-41d4-a716-446655440000",
    "accessLevel": "private",
    "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001",
    "updatedAt": "2026-01-26T20:30:00Z"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Marketing Team",
    "description": "Marketing and communications",
    "owners": "550e8400-e29b-41d4-a716-446655440001",
    "accessLevel": "public",
    "memberIds": "550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003",
    "updatedAt": "2026-01-25T15:20:00Z"
  }
]
```

**Example Response (200) - Empty:**
```json
[]
```

### Get Specific Teamspace
```bash
GET /api/settings/teamspaces/{teamspaceId}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/settings/teamspaces/880e8400-e29b-41d4-a716-446655440003
```

**Example Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Product Team",
  "description": "Main product development",
  "owners": "550e8400-e29b-41d4-a716-446655440000",
  "accessLevel": "private",
  "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001",
  "updatedAt": "2026-01-26T20:30:00Z"
}
```

**Example Response (404):**
```json
{}
```

### Create Teamspace
```bash
POST /api/settings/teamspaces
Content-Type: application/json
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/settings/teamspaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Design Team",
    "description": "UI/UX Design",
    "owners": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440002",
    "accessLevel": "private",
    "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003"
  }'
```

**Example Response (201):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440005",
  "name": "Design Team",
  "description": "UI/UX Design",
  "owners": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440002",
  "accessLevel": "private",
  "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003",
  "updatedAt": "2026-01-26T21:00:00Z"
}
```

### Update Teamspace
```bash
PUT /api/settings/teamspaces/{teamspaceId}
Content-Type: application/json
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/settings/teamspaces/880e8400-e29b-41d4-a716-446655440003 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Team (Updated)",
    "description": "Core product development",
    "owners": "550e8400-e29b-41d4-a716-446655440000",
    "accessLevel": "public",
    "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440004"
  }'
```

**Example Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Product Team (Updated)",
  "description": "Core product development",
  "owners": "550e8400-e29b-41d4-a716-446655440000",
  "accessLevel": "public",
  "memberIds": "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440004",
  "updatedAt": "2026-01-26T21:05:00Z"
}
```

### Delete Teamspace
```bash
DELETE /api/settings/teamspaces/{teamspaceId}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/settings/teamspaces/880e8400-e29b-41d4-a716-446655440005
```

**Example Response (204):**
```
No Content
```

**Example Response (404):**
```json
{}
```

---

## Testing with Postman

### Import Collection
Create a new Postman collection with the following requests:

1. **Get Account Settings**
   - Method: GET
   - URL: `{{base_url}}/settings/account/{{userId}}`

2. **Update Account Settings**
   - Method: PUT
   - URL: `{{base_url}}/settings/account/{{userId}}`
   - Body (JSON):
   ```json
   {
     "preferredName": "Your Name",
     "name": "Full Name",
     "avatar": "https://example.com/avatar.jpg"
   }
   ```

3. **Get Preferences**
   - Method: GET
   - URL: `{{base_url}}/settings/preferences/{{userId}}`

4. **Update Preferences**
   - Method: PUT
   - URL: `{{base_url}}/settings/preferences/{{userId}}`
   - Body (JSON):
   ```json
   {
     "theme": "dark",
     "language": "en",
     "spellcheckerLanguages": "en,es",
     "timezone": "UTC",
     "use24HourFormat": false
   }
   ```

5. **Get Workspace Settings**
   - Method: GET
   - URL: `{{base_url}}/settings/workspace/{{userId}}`

6. **Update Workspace Settings**
   - Method: PUT
   - URL: `{{base_url}}/settings/workspace/{{userId}}`
   - Body (JSON):
   ```json
   {
     "workspaceName": "My Workspace",
     "workspaceIcon": "📓",
     "customLandingPageJson": null,
     "allowPublicAccess": false,
     "enableNotifications": true,
     "enableEmailNotifications": true
   }
   ```

7. **List Teamspaces**
   - Method: GET
   - URL: `{{base_url}}/settings/teamspaces`

8. **Create Teamspace**
   - Method: POST
   - URL: `{{base_url}}/settings/teamspaces`
   - Body (JSON):
   ```json
   {
     "name": "My Team",
     "description": "Team description",
     "owners": "user-id",
     "accessLevel": "private",
     "memberIds": "user-id1,user-id2"
   }
   ```

### Environment Variables
Set these variables in Postman:
```
{{base_url}} = http://localhost:8080/api
{{userId}} = 550e8400-e29b-41d4-a716-446655440000
```

---

## Error Responses

### 404 - Not Found
```json
{}
```

### 400 - Bad Request
```json
{
  "timestamp": "2026-01-26T20:45:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request body"
}
```

### 500 - Internal Server Error
```json
{
  "timestamp": "2026-01-26T20:45:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Database error occurred"
}
```

---

## Testing Scenarios

### Scenario 1: New User
1. User logs in
2. GET `/api/settings/preferences/{userId}` → 200 (creates defaults)
3. GET `/api/settings/workspace/{userId}` → 200 (creates defaults)
4. User modifies settings
5. PUT `/api/settings/preferences/{userId}` → 200
6. Frontend shows success toast

### Scenario 2: Update Teamspace
1. Admin clicks teamspace
2. GET `/api/settings/teamspaces/{teamspaceId}` → 200
3. Admin modifies name/members
4. PUT `/api/settings/teamspaces/{teamspaceId}` → 200
5. List updates automatically

### Scenario 3: Create Teamspace
1. Admin clicks "Create Teamspace"
2. POST `/api/settings/teamspaces` → 201
3. New teamspace appears in list
4. Can immediately edit

---

## Performance Notes

- All endpoints are fast (single DB query)
- GET endpoints with defaults create records lazily
- PUT endpoints use efficient update-or-create pattern
- No N+1 queries
- Suitable for high-traffic scenarios

---

## Debugging Tips

1. **Check API Response**: Use browser DevTools Network tab
2. **Verify UserID**: Console.log userId in frontend
3. **Check Logs**: Backend logs show SQL queries
4. **Test with cURL**: Isolate frontend issues
5. **Database Query**: Verify data was saved correctly

---

## Future API Enhancements

- [ ] Pagination for teamspaces
- [ ] Filter teamspaces by access level
- [ ] Bulk operations for member management
- [ ] Activity logs
- [ ] Validation rules
- [ ] Rate limiting
- [ ] Caching
