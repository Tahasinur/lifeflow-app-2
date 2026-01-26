# Follow System and Notification Triggers Implementation Guide

## Overview
This document describes the implementation of a comprehensive follow system and notification triggers for the LifeFlow application to enhance user engagement.

## Architecture

### 1. Database Models

#### Follow Entity
- **Table**: `follows`
- **Purpose**: Manages user follow relationships
- **Key Fields**:
  - `id`: Unique identifier
  - `follower_id`: User who is following
  - `following_id`: User being followed
  - `is_muted`: Whether notifications from this user are muted
  - `muted_at`: Timestamp when user was muted
  - `created_at`: When the follow relationship was created

#### Notification Entity
- **Table**: `notifications`
- **Purpose**: Stores user notifications
- **Key Fields**:
  - `id`: Unique identifier
  - `recipient_id`: User receiving the notification
  - `actor_id`: User who triggered the notification
  - `type`: Type of notification (enum)
  - `message`: Notification message
  - `related_entity_id`: ID of related entity (post, comment, etc.)
  - `related_entity_type`: Type of related entity
  - `is_read`: Whether notification has been read
  - `created_at`: When notification was created
  - `read_at`: When notification was read

### 2. Notification Types

```
NEW_FOLLOWER - User started following you
NEW_POST_FROM_FOLLOWING - User you follow posted something
POST_LIKED - Your post was liked
POST_COMMENTED - Someone commented on your post
COMMENT_REPLIED - Someone replied to your comment
MESSAGE_RECEIVED - New direct message
FOLLOW_ACCEPTED - Follow request was accepted
MENTION - You were mentioned in a post
ENGAGEMENT - Generic engagement notification
```

## Services

### FollowService
Manages all follow/unfollow operations:

**Key Methods**:
- `followUser(String followerId, String followingId)` - Create follow relationship
- `unfollowUser(String followerId, String followingId)` - Remove follow relationship
- `muteUser(String followerId, String followingId)` - Mute notifications from user
- `unmuteUser(String followerId, String followingId)` - Unmute notifications from user
- `isFollowing(String followerId, String followingId)` - Check follow status
- `getFollowers(String userId, Pageable)` - Get user's followers
- `getFollowing(String userId, Pageable)` - Get users being followed
- `getFollowerCount(String userId)` - Get follower count
- `getFollowingCount(String userId)` - Get following count
- `getMutedFollows(String userId)` - Get muted follows
- `getActiveFollowingUsers(String userId)` - Get non-muted follows

### NotificationService
Manages notification operations:

**Key Methods**:
- `createFollowerNotification(User follower, User following)` - Notify new follower
- `createPostLikedNotification(User liker, User postAuthor, String postId)` - Notify post like
- `createPostCommentedNotification(User commenter, User postAuthor, String postId, String commentId)` - Notify post comment
- `createCommentRepliedNotification(User replier, User commentAuthor, String postId, String commentId)` - Notify comment reply
- `createMentionNotification(User mentioner, User mentionedUser, String postId, String context)` - Notify mention
- `getNotifications(String userId, Pageable)` - Get all notifications
- `getUnreadNotifications(String userId, Pageable)` - Get unread notifications
- `getNotificationsByType(String userId, NotificationType, Pageable)` - Get notifications by type
- `getUnreadCount(String userId)` - Get unread notification count
- `markAsRead(String notificationId)` - Mark notification as read
- `markAllAsRead(String userId)` - Mark all notifications as read
- `deleteNotification(String notificationId)` - Delete notification
- `deleteOldNotifications(String userId)` - Delete notifications older than 30 days
- `getNotificationSummary(String userId)` - Get notification summary statistics

### NotificationTriggerService
Triggers notifications based on user actions:

**Key Methods**:
- `triggerNewPostNotifications(User postAuthor, String postId)` - Notify all followers of new post
- `triggerPostLikedNotification(User liker, User postAuthor, String postId)` - Notify post like
- `triggerPostCommentedNotification(User commenter, User postAuthor, String postId, String commentId)` - Notify post comment
- `triggerCommentRepliedNotification(User replier, User commentAuthor, String postId, String commentId)` - Notify comment reply
- `triggerMentionNotification(User mentioner, User mentionedUser, String postId)` - Notify mention

## REST API Endpoints

### Follow Endpoints

#### POST /api/follows/{followerId}/follow/{followingId}
Follow a user
- **Response**: Follow object with success message

#### DELETE /api/follows/{followerId}/unfollow/{followingId}
Unfollow a user
- **Response**: Success message

#### POST /api/follows/{followerId}/mute/{followingId}
Mute notifications from a user
- **Response**: Updated Follow object

#### POST /api/follows/{followerId}/unmute/{followingId}
Unmute notifications from a user
- **Response**: Updated Follow object

#### GET /api/follows/{followerId}/is-following/{followingId}
Check if user is following another user
- **Response**: { "isFollowing": boolean }

#### GET /api/follows/{userId}/followers
Get followers of a user
- **Query Parameters**: page (default: 0), size (default: 20)
- **Response**: Paginated list of FollowDTO

#### GET /api/follows/{userId}/following
Get users that a user is following
- **Query Parameters**: page (default: 0), size (default: 20)
- **Response**: Paginated list of FollowDTO

#### GET /api/follows/{userId}/follower-count
Get follower count
- **Response**: { "followerCount": long }

#### GET /api/follows/{userId}/following-count
Get following count
- **Response**: { "followingCount": long }

#### GET /api/follows/{userId}/muted
Get muted follows
- **Response**: Array of Follow objects

### Notification Endpoints

#### GET /api/notifications/{userId}
Get all notifications for a user
- **Query Parameters**: page (default: 0), size (default: 20)
- **Response**: Paginated list of NotificationDTO

#### GET /api/notifications/{userId}/unread
Get unread notifications for a user
- **Query Parameters**: page (default: 0), size (default: 20)
- **Response**: Paginated list of NotificationDTO

#### GET /api/notifications/{userId}/type/{type}
Get notifications by type
- **Query Parameters**: page (default: 0), size (default: 20)
- **Response**: Paginated list of NotificationDTO

#### GET /api/notifications/{userId}/unread-count
Get unread notification count
- **Response**: { "unreadCount": long }

#### PUT /api/notifications/{notificationId}/read
Mark notification as read
- **Response**: Success message

#### PUT /api/notifications/{userId}/read-all
Mark all notifications as read
- **Response**: Success message

#### DELETE /api/notifications/{notificationId}
Delete a notification
- **Response**: Success message

#### DELETE /api/notifications/{userId}/cleanup-old
Delete old notifications (older than 30 days)
- **Response**: Success message

#### GET /api/notifications/{userId}/summary
Get notification summary
- **Response**: { "totalNotifications": long, "unreadCount": long, "readCount": long }

## Integration with Existing Features

### Feed System Integration
When a user creates a new post:
1. Post is created in FeedItem table
2. NotificationTriggerService.triggerNewPostNotifications() is called
3. All followers of the post author receive NEW_POST_FROM_FOLLOWING notification (except muted users)

### Comment System Integration
When a user comments on a post:
1. Comment is created
2. NotificationTriggerService.triggerPostCommentedNotification() is called
3. Post author receives POST_COMMENTED notification

When a user replies to a comment:
1. Reply is created
2. NotificationTriggerService.triggerCommentRepliedNotification() is called
3. Original comment author receives COMMENT_REPLIED notification

### Like System Integration
When a user likes a post:
1. Like is created
2. NotificationTriggerService.triggerPostLikedNotification() is called
3. Post author receives POST_LIKED notification

### Mention System Integration
When a user mentions another user:
1. Mention is processed
2. NotificationTriggerService.triggerMentionNotification() is called
3. Mentioned user receives MENTION notification

## DTOs

### FollowDTO
```json
{
  "id": "UUID",
  "userId": "String",
  "userName": "String",
  "userEmail": "String",
  "userAvatar": "String",
  "userBio": "String",
  "isMuted": "Boolean",
  "createdAt": "LocalDateTime"
}
```

### NotificationDTO
```json
{
  "id": "UUID",
  "recipientId": "String",
  "actorId": "String",
  "actorName": "String",
  "actorAvatar": "String",
  "type": "NotificationType",
  "message": "String",
  "relatedEntityId": "String",
  "relatedEntityType": "String",
  "isRead": "Boolean",
  "createdAt": "LocalDateTime",
  "readAt": "LocalDateTime"
}
```

## Usage Examples

### Follow a User
```
POST /api/follows/user-123/follow/user-456
Response: { "success": true, "message": "Successfully followed user" }
```

### Get User's Followers
```
GET /api/follows/user-123/followers?page=0&size=20
Response: 
{
  "content": [FollowDTO, ...],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0
}
```

### Get Unread Notifications
```
GET /api/notifications/user-123/unread?page=0&size=10
Response:
{
  "content": [NotificationDTO, ...],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

### Mark All Notifications as Read
```
PUT /api/notifications/user-123/read-all
Response: { "success": true, "message": "All notifications marked as read" }
```

### Mute a User
```
POST /api/follows/user-123/mute/user-456
Response: { "success": true, "message": "Successfully muted user" }
```

## Best Practices

1. **Performance**: Use pagination for all list endpoints
2. **Notification Cleanup**: Regularly clean up old notifications (older than 30 days)
3. **Muting**: Users can mute followers to avoid notification spam
4. **Unread Count**: Display unread notification badge on UI
5. **Real-time Updates**: Consider implementing WebSocket for real-time notifications
6. **Deduplication**: Avoid duplicate notifications within a short time window
7. **Batching**: For bulk operations, consider batching notifications

## Future Enhancements

1. **WebSocket Real-time Notifications**: Implement real-time notification delivery
2. **Email Notifications**: Send email digests of important notifications
3. **Notification Preferences**: Allow users to configure which notifications they receive
4. **Follow Requests**: For private accounts (if implemented)
5. **Mutual Follows**: Display mutual follower information
6. **Trending Notifications**: Aggregate trending notifications
7. **Notification Grouping**: Group similar notifications together
8. **Push Notifications**: Mobile push notifications for important events

## File Structure

```
Backend Models:
- model/Follow.java
- model/Notification.java
- enums/NotificationType.java

Backend Repositories:
- repository/FollowRepository.java
- repository/NotificationRepository.java

Backend Services:
- services/FollowService.java
- services/NotificationService.java
- services/NotificationTriggerService.java

Backend Controllers:
- controller/FollowController.java
- controller/NotificationController.java

Backend DTOs:
- dto/FollowDTO.java
- dto/NotificationDTO.java
```

## Testing

### Unit Tests
- Test follow/unfollow operations
- Test notification creation and retrieval
- Test muting/unmuting functionality
- Test notification read/unread operations

### Integration Tests
- Test complete follow flow with notifications
- Test notification triggers for various user actions
- Test pagination and filtering
- Test error handling and validation

### Performance Tests
- Load test notification queries with large datasets
- Benchmark bulk notification operations
- Test concurrent follow/notification operations
