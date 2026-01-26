# Follow & Notification System - API Documentation

## Base URL
```
http://localhost:8080/api
```

---

## Follow API Endpoints

### 1. Follow a User
**Endpoint**: `POST /follows/{followerId}/follow/{followingId}`

**Description**: Creates a follow relationship between two users

**Path Parameters**:
- `followerId` (String, UUID): ID of the user who is following
- `followingId` (String, UUID): ID of the user to be followed

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully followed user",
  "follow": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "follower": { "id": "...", "name": "...", "email": "..." },
    "following": { "id": "...", "name": "...", "email": "..." },
    "isMuted": false,
    "createdAt": "2024-01-27T10:30:00"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Cannot follow yourself"
}
```

---

### 2. Unfollow a User
**Endpoint**: `DELETE /follows/{followerId}/unfollow/{followingId}`

**Description**: Removes a follow relationship

**Path Parameters**:
- `followerId` (String, UUID): ID of the user who is following
- `followingId` (String, UUID): ID of the user to be unfollowed

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully unfollowed user"
}
```

---

### 3. Mute a User
**Endpoint**: `POST /follows/{followerId}/mute/{followingId}`

**Description**: Mutes notifications from a followed user

**Path Parameters**:
- `followerId` (String, UUID): ID of the user who is following
- `followingId` (String, UUID): ID of the user to mute

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully muted user",
  "follow": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isMuted": true,
    "mutedAt": "2024-01-27T10:30:00"
  }
}
```

---

### 4. Unmute a User
**Endpoint**: `POST /follows/{followerId}/unmute/{followingId}`

**Description**: Unmutes notifications from a previously muted user

**Path Parameters**:
- `followerId` (String, UUID): ID of the user who is following
- `followingId` (String, UUID): ID of the user to unmute

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully unmuted user",
  "follow": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isMuted": false,
    "mutedAt": null
  }
}
```

---

### 5. Check Follow Status
**Endpoint**: `GET /follows/{followerId}/is-following/{followingId}`

**Description**: Checks if user is following another user

**Path Parameters**:
- `followerId` (String, UUID): ID of the user who might be following
- `followingId` (String, UUID): ID of the user who might be followed

**Response** (200 OK):
```json
{
  "isFollowing": true
}
```

---

### 6. Get Followers
**Endpoint**: `GET /follows/{userId}/followers`

**Description**: Gets paginated list of followers for a user

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Query Parameters**:
- `page` (Integer, optional, default: 0): Page number (0-indexed)
- `size` (Integer, optional, default: 20): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "follow-uuid-1",
      "userId": "user-uuid-1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userAvatar": "avatar-url",
      "userBio": "Developer and creator",
      "isMuted": false,
      "createdAt": "2024-01-27T10:30:00"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "size": 20
}
```

---

### 7. Get Following
**Endpoint**: `GET /follows/{userId}/following`

**Description**: Gets paginated list of users that the user is following

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Query Parameters**:
- `page` (Integer, optional, default: 0): Page number (0-indexed)
- `size` (Integer, optional, default: 20): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "follow-uuid-1",
      "userId": "user-uuid-2",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "userAvatar": "avatar-url",
      "userBio": "Designer and artist",
      "isMuted": false,
      "createdAt": "2024-01-25T14:20:00"
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "currentPage": 0,
  "size": 20
}
```

---

### 8. Get Follower Count
**Endpoint**: `GET /follows/{userId}/follower-count`

**Description**: Gets the number of followers for a user

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "followerCount": 150
}
```

---

### 9. Get Following Count
**Endpoint**: `GET /follows/{userId}/following-count`

**Description**: Gets the number of users that the user is following

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "followingCount": 42
}
```

---

### 10. Get Muted Follows
**Endpoint**: `GET /follows/{userId}/muted`

**Description**: Gets all muted follows for a user

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "mutedFollows": [
    {
      "id": "follow-uuid-1",
      "follower": { "id": "...", "name": "..." },
      "following": { "id": "...", "name": "..." },
      "isMuted": true,
      "mutedAt": "2024-01-26T09:15:00"
    }
  ]
}
```

---

## Notification API Endpoints

### 1. Get All Notifications
**Endpoint**: `GET /notifications/{userId}`

**Description**: Gets paginated list of all notifications for a user

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Query Parameters**:
- `page` (Integer, optional, default: 0): Page number (0-indexed)
- `size` (Integer, optional, default: 20): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "notification-uuid-1",
      "recipientId": "user-uuid-1",
      "actorId": "user-uuid-2",
      "actorName": "John Doe",
      "actorAvatar": "avatar-url",
      "type": "NEW_FOLLOWER",
      "message": "John Doe started following you",
      "relatedEntityId": "user-uuid-2",
      "relatedEntityType": "USER",
      "isRead": false,
      "createdAt": "2024-01-27T10:30:00",
      "readAt": null
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0,
  "size": 20
}
```

---

### 2. Get Unread Notifications
**Endpoint**: `GET /notifications/{userId}/unread`

**Description**: Gets paginated list of unread notifications

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Query Parameters**:
- `page` (Integer, optional, default: 0): Page number (0-indexed)
- `size` (Integer, optional, default: 20): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "notification-uuid-1",
      "recipientId": "user-uuid-1",
      "actorId": "user-uuid-2",
      "actorName": "John Doe",
      "actorAvatar": "avatar-url",
      "type": "POST_LIKED",
      "message": "John Doe liked your post",
      "relatedEntityId": "post-uuid-1",
      "relatedEntityType": "POST",
      "isRead": false,
      "createdAt": "2024-01-27T10:30:00",
      "readAt": null
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0,
  "size": 20
}
```

---

### 3. Get Notifications by Type
**Endpoint**: `GET /notifications/{userId}/type/{type}`

**Description**: Gets notifications filtered by type

**Path Parameters**:
- `userId` (String, UUID): ID of the user
- `type` (String, enum): Notification type (NEW_FOLLOWER, NEW_POST_FROM_FOLLOWING, POST_LIKED, POST_COMMENTED, COMMENT_REPLIED, MESSAGE_RECEIVED, FOLLOW_ACCEPTED, MENTION, ENGAGEMENT)

**Query Parameters**:
- `page` (Integer, optional, default: 0): Page number (0-indexed)
- `size` (Integer, optional, default: 20): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "notification-uuid-1",
      "type": "POST_LIKED",
      "message": "John Doe liked your post",
      "isRead": false,
      "createdAt": "2024-01-27T10:30:00"
    }
  ],
  "totalElements": 12,
  "totalPages": 1,
  "currentPage": 0,
  "size": 20
}
```

---

### 4. Get Unread Count
**Endpoint**: `GET /notifications/{userId}/unread-count`

**Description**: Gets count of unread notifications

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "unreadCount": 5
}
```

---

### 5. Mark Notification as Read
**Endpoint**: `PUT /notifications/{notificationId}/read`

**Description**: Marks a specific notification as read

**Path Parameters**:
- `notificationId` (String, UUID): ID of the notification

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 6. Mark All as Read
**Endpoint**: `PUT /notifications/{userId}/read-all`

**Description**: Marks all notifications as read for a user

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 7. Delete Notification
**Endpoint**: `DELETE /notifications/{notificationId}`

**Description**: Deletes a specific notification

**Path Parameters**:
- `notificationId` (String, UUID): ID of the notification

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### 8. Cleanup Old Notifications
**Endpoint**: `DELETE /notifications/{userId}/cleanup-old`

**Description**: Deletes notifications older than 30 days

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Old notifications deleted"
}
```

---

### 9. Get Notification Summary
**Endpoint**: `GET /notifications/{userId}/summary`

**Description**: Gets notification statistics summary

**Path Parameters**:
- `userId` (String, UUID): ID of the user

**Response** (200 OK):
```json
{
  "totalNotifications": 45,
  "unreadCount": 5,
  "readCount": 40
}
```

---

## Notification Types

| Type | Description |
|------|-------------|
| `NEW_FOLLOWER` | User started following you |
| `NEW_POST_FROM_FOLLOWING` | User you follow posted something |
| `POST_LIKED` | Your post was liked |
| `POST_COMMENTED` | Someone commented on your post |
| `COMMENT_REPLIED` | Someone replied to your comment |
| `MESSAGE_RECEIVED` | New direct message |
| `FOLLOW_ACCEPTED` | Follow request was accepted |
| `MENTION` | You were mentioned in a post |
| `ENGAGEMENT` | Generic engagement notification |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Cannot follow yourself | User tried to follow themselves |
| 400 | User not found | One or both users don't exist |
| 400 | Already following this user | Follow relationship already exists |
| 400 | Not following this user | Follow relationship doesn't exist |
| 404 | Resource not found | Notification or follow doesn't exist |
| 500 | Internal server error | Server error |

---

## Example Workflows

### Complete Follow Workflow

1. **Check if following**
   ```
   GET /follows/user1-id/is-following/user2-id
   ```

2. **If not following, follow user**
   ```
   POST /follows/user1-id/follow/user2-id
   ```

3. **Get followers list**
   ```
   GET /follows/user2-id/followers?page=0&size=20
   ```

4. **Get follower count**
   ```
   GET /follows/user2-id/follower-count
   ```

### Notification Management Workflow

1. **Get unread count**
   ```
   GET /notifications/user1-id/unread-count
   ```

2. **Get unread notifications**
   ```
   GET /notifications/user1-id/unread?page=0&size=10
   ```

3. **Mark specific notification as read**
   ```
   PUT /notifications/notification-id/read
   ```

4. **Get notification summary**
   ```
   GET /notifications/user1-id/summary
   ```

---

## Rate Limiting

Current implementation does not have built-in rate limiting. Consider implementing:
- Max 100 follow/unfollow operations per minute per user
- Max 1000 notification fetches per day per user
- Max 100 notification deletions per day per user

---

## CORS Configuration

All endpoints have CORS enabled for:
- Origin: `http://localhost:3000`

Update in controller if needed:
```java
@CrossOrigin(origins = "http://your-frontend-url:port")
```

---

## Authentication

All endpoints require authentication (based on current project setup). Ensure JWT token is included in headers when calling from frontend.

---

## Version History

- **v1.0** (2024-01-27): Initial release with follow and notification system
