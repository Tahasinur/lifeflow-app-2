# Follow & Notification System - Quick Setup & Integration Guide

## Quick Setup

### 1. Database Migration

The Follow and Notification entities will automatically create the following tables:

- `follows` - Manages user follow relationships
- `notifications` - Stores user notifications

### 2. Environment Configuration

Add to your `application.properties` or `application.yml`:

```properties
# Notification settings
notification.cleanup.days=30
notification.batch.size=100

# Follow settings
follow.allow-self-follow=false
```

### 3. Dependency Injection

The services are automatically registered as Spring beans and can be injected:

```java
@RestController
@RequestMapping("/api/my-endpoint")
public class MyController {
    
    private final FollowService followService;
    private final NotificationService notificationService;
    private final NotificationTriggerService triggerService;
    
    public MyController(
            FollowService followService,
            NotificationService notificationService,
            NotificationTriggerService triggerService) {
        this.followService = followService;
        this.notificationService = notificationService;
        this.triggerService = triggerService;
    }
    
    // Use services in your endpoints
}
```

## Integration with FeedController

To trigger notifications when a user creates a post:

```java
@PostMapping("/posts")
public ResponseEntity<?> createPost(@RequestBody FeedItemRequest request, 
                                   @RequestHeader String userId) {
    // Create feed item
    FeedItem feedItem = feedItemRepository.save(new FeedItem(...));
    
    // Trigger notifications to all followers
    User author = userRepository.findById(userId).orElseThrow();
    notificationTriggerService.triggerNewPostNotifications(author, feedItem.getId());
    
    return ResponseEntity.ok(feedItem);
}
```

## Integration with Comment System

To trigger notifications when a comment is created:

```java
@PostMapping("/posts/{postId}/comments")
public ResponseEntity<?> addComment(@PathVariable String postId,
                                   @RequestBody CommentRequest request,
                                   @RequestHeader String userId) {
    // Create comment
    Comment comment = commentRepository.save(new Comment(...));
    
    // Get post author and trigger notification
    FeedItem post = feedItemRepository.findById(postId).orElseThrow();
    User commenter = userRepository.findById(userId).orElseThrow();
    
    notificationTriggerService.triggerPostCommentedNotification(
        commenter, 
        post.getAuthor(), 
        postId, 
        comment.getId()
    );
    
    return ResponseEntity.ok(comment);
}
```

## Integration with Like System

To trigger notifications when a post is liked:

```java
@PostMapping("/posts/{postId}/like")
public ResponseEntity<?> likePost(@PathVariable String postId,
                                 @RequestHeader String userId) {
    // Create like
    User liker = userRepository.findById(userId).orElseThrow();
    FeedItem post = feedItemRepository.findById(postId).orElseThrow();
    
    // Trigger notification
    notificationTriggerService.triggerPostLikedNotification(
        liker, 
        post.getAuthor(), 
        postId
    );
    
    return ResponseEntity.ok().build();
}
```

## Frontend Integration Points

### Follow Button
```javascript
// Follow a user
async function followUser(followerId, followingId) {
  const response = await fetch(`/api/follows/${followerId}/follow/${followingId}`, {
    method: 'POST'
  });
  return response.json();
}

// Unfollow a user
async function unfollowUser(followerId, followingId) {
  const response = await fetch(`/api/follows/${followerId}/unfollow/${followingId}`, {
    method: 'DELETE'
  });
  return response.json();
}

// Check if following
async function isFollowing(followerId, followingId) {
  const response = await fetch(`/api/follows/${followerId}/is-following/${followingId}`);
  return (await response.json()).isFollowing;
}
```

### Notification Badge
```javascript
// Get unread notification count
async function getUnreadCount(userId) {
  const response = await fetch(`/api/notifications/${userId}/unread-count`);
  return (await response.json()).unreadCount;
}

// Update badge on page
function updateNotificationBadge(userId) {
  getUnreadCount(userId).then(count => {
    const badge = document.getElementById('notification-badge');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  });
}
```

### Notifications List
```javascript
// Get notifications
async function getNotifications(userId, page = 0, size = 20) {
  const response = await fetch(
    `/api/notifications/${userId}?page=${page}&size=${size}`
  );
  return response.json();
}

// Get unread notifications
async function getUnreadNotifications(userId, page = 0, size = 20) {
  const response = await fetch(
    `/api/notifications/${userId}/unread?page=${page}&size=${size}`
  );
  return response.json();
}

// Mark as read
async function markNotificationAsRead(notificationId) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT'
  });
  return response.json();
}

// Mark all as read
async function markAllAsRead(userId) {
  const response = await fetch(`/api/notifications/${userId}/read-all`, {
    method: 'PUT'
  });
  return response.json();
}
```

### Followers/Following Lists
```javascript
// Get followers
async function getFollowers(userId, page = 0, size = 20) {
  const response = await fetch(
    `/api/follows/${userId}/followers?page=${page}&size=${size}`
  );
  return response.json();
}

// Get following
async function getFollowing(userId, page = 0, size = 20) {
  const response = await fetch(
    `/api/follows/${userId}/following?page=${page}&size=${size}`
  );
  return response.json();
}

// Get counts
async function getFollowStats(userId) {
  const followerCount = await fetch(`/api/follows/${userId}/follower-count`);
  const followingCount = await fetch(`/api/follows/${userId}/following-count`);
  
  return {
    followers: (await followerCount.json()).followerCount,
    following: (await followingCount.json()).followingCount
  };
}
```

## API Integration Examples

### cURL Examples

#### Follow a user
```bash
curl -X POST http://localhost:8080/api/follows/user1-id/follow/user2-id
```

#### Get followers
```bash
curl http://localhost:8080/api/follows/user-id/followers?page=0&size=20
```

#### Get notifications
```bash
curl http://localhost:8080/api/notifications/user-id?page=0&size=20
```

#### Mark notification as read
```bash
curl -X PUT http://localhost:8080/api/notifications/notification-id/read
```

#### Mute a user
```bash
curl -X POST http://localhost:8080/api/follows/user1-id/mute/user2-id
```

## Error Handling

### Common Errors

**Cannot follow yourself**
- Status: 400 Bad Request
- Response: `{ "success": false, "message": "Cannot follow yourself" }`

**User not found**
- Status: 400 Bad Request
- Response: `{ "success": false, "message": "User not found" }`

**Already following**
- Status: 400 Bad Request
- Response: `{ "success": false, "message": "Already following this user" }`

**Not following**
- Status: 400 Bad Request
- Response: `{ "success": false, "message": "Not following this user" }`

## Performance Considerations

1. **Database Indexes**: Ensure indexes on follow_follower_id and follow_following_id
2. **Pagination**: Always use pagination for lists to limit database queries
3. **Caching**: Consider caching follower counts using Redis
4. **Batch Operations**: Use batch queries for multiple operations
5. **Notification Cleanup**: Regularly cleanup old notifications

## Monitoring & Logging

Add logging to track notification system usage:

```java
@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    public void createFollowerNotification(User follower, User following) {
        logger.info("Creating follower notification: {} -> {}", 
                    follower.getId(), following.getId());
        // ... rest of implementation
    }
}
```

## Testing

Run the included test suites:

```bash
# Run follow system tests
mvn test -Dtest=FollowSystemTest

# Run notification service tests
mvn test -Dtest=NotificationServiceTest

# Run all tests
mvn test
```

## Troubleshooting

### Notifications not appearing
1. Verify Follow relationship exists
2. Check that Follow.isMuted is false
3. Verify user IDs are correct
4. Check database for notification records

### Performance issues
1. Check database indexes on notification tables
2. Verify pagination is being used
3. Consider implementing caching layer
4. Monitor query performance

### CORS issues
- Ensure @CrossOrigin annotation includes your frontend URL
- Update `cors.origins` in application properties if needed

## Next Steps

1. **Frontend Development**: Implement UI components for follow/notification features
2. **Real-time Updates**: Consider WebSocket implementation for live notifications
3. **Email Notifications**: Add email digest feature
4. **Push Notifications**: Implement mobile push notifications
5. **Analytics**: Add tracking for engagement metrics
