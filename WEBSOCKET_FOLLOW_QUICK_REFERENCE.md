# WebSocket & Follow System - Quick Reference Guide

## 🚀 Quick Start

### For Backend Developers

#### 1. WebSocket Configuration
Located: `backend/src/main/java/com/lifeflow/backend/config/WebSocketConfig.java`

**Key Points:**
- STOMP message broker enabled
- Endpoints: `/ws`, `/ws/notifications`, `/ws/social`
- Message prefixes: `/app`, `/user`, `/topic`

#### 2. Triggering Notifications
```java
// In your service/controller:
@Autowired
private SimpMessagingTemplate messagingTemplate;

// Send to specific user
messagingTemplate.convertAndSendToUser(
    userId,
    "/queue/notifications",
    notificationData
);

// Send to topic (broadcast)
messagingTemplate.convertAndSend(
    "/topic/social/follows",
    notificationData
);
```

#### 3. Event Handlers
Located: `backend/src/main/java/com/lifeflow/backend/event/WebSocketEventHandler.java`

**Methods:**
- `handleWebSocketConnectListener()` - User connects
- `handleWebSocketDisconnectListener()` - User disconnects
- `isUserOnline(userId)` - Check if user online
- `getConnectedUsers()` - Get all connected users

---

### For Frontend Developers

#### 1. Using Follow Service
```typescript
import { followService } from '../services/followService';

// Follow a user
await followService.followUser(currentUserId, targetUserId);

// Check if following
const isFollowing = await followService.isFollowing(currentUserId, targetUserId);

// Get counts
const followerCount = await followService.getFollowerCount(userId);
const followingCount = await followService.getFollowingCount(userId);
```

#### 2. Using WebSocket Notifications
```typescript
import { webSocketNotificationService } from '../services/webSocketNotificationService';

// Connect to WebSocket
await webSocketNotificationService.connect(userId);

// Listen for notifications
const unsubscribe = webSocketNotificationService.onNotification((notification) => {
  console.log('New notification:', notification);
});

// Publish follow event
webSocketNotificationService.publishFollowEvent(
  targetUserId,
  currentUserName,
  currentUserAvatar
);

// Cleanup
unsubscribe();
```

#### 3. Using FollowButton Component
```tsx
import { FollowButton } from '../components/FollowButton';

<FollowButton
  currentUserId={currentUserId}
  targetUserId={targetUserId}
  targetUserName={targetUserName}
  targetUserAvatar={targetUserAvatar}
  onFollowChange={(isFollowing) => {
    // Handle follow state change
  }}
/>
```

#### 4. Using Notification Badge
```tsx
import { NotificationBadge } from '../components/NotificationBadge';

<NotificationBadge userId={userId} className="mr-4" />
```

---

## 📂 File Structure

```
backend/
├── src/main/java/com/lifeflow/backend/
│   ├── config/
│   │   └── WebSocketConfig.java          ← WebSocket setup
│   ├── controller/
│   │   ├── FollowController.java         ← Follow REST endpoints
│   │   └── NotificationWebSocketController.java  ← WebSocket messages
│   ├── event/
│   │   └── WebSocketEventHandler.java    ← Connection lifecycle
│   ├── services/
│   │   ├── FollowService.java            ← Follow business logic
│   │   └── NotificationService.java      ← Notification business logic
│   └── repository/
│       ├── FollowRepository.java         ← Follow persistence
│       └── NotificationRepository.java   ← Notification persistence

frontend/
├── src/
│   ├── services/
│   │   ├── followService.ts              ← REST API integration
│   │   └── webSocketNotificationService.ts  ← WebSocket client
│   ├── components/
│   │   ├── FollowButton.tsx              ← Follow UI component
│   │   └── NotificationBadge.tsx         ← Notification UI
│   └── pages/
│       └── UserProfilePage.tsx           ← Profile with Follow button
```

---

## 🔌 WebSocket Messages

### Follow Event
```json
{
  "type": "FOLLOW",
  "followerId": "user-123",
  "followerName": "John Doe",
  "followerAvatar": "https://...",
  "timestamp": 1704067200000
}
```

### Unfollow Event
```json
{
  "type": "UNFOLLOW",
  "followerId": "user-123",
  "followerName": "John Doe",
  "timestamp": 1704067200000
}
```

### User Status
```json
{
  "type": "USER_STATUS",
  "userId": "user-123",
  "status": "online|offline",
  "timestamp": 1704067200000
}
```

---

## 🔗 API Endpoints

### Follow Endpoints
```
POST   /api/follows/{followerId}/follow/{followingId}
DELETE /api/follows/{followerId}/unfollow/{followingId}
GET    /api/follows/{followerId}/is-following/{followingId}
GET    /api/follows/{userId}/followers?page=0&size=20
GET    /api/follows/{userId}/following?page=0&size=20
GET    /api/follows/{userId}/follower-count
GET    /api/follows/{userId}/following-count
POST   /api/follows/{followerId}/mute/{followingId}
POST   /api/follows/{followerId}/unmute/{followingId}
GET    /api/follows/{userId}/muted
```

### Notification Endpoints
```
GET    /api/notifications/{userId}/unread?page=0&size=10
GET    /api/notifications/{userId}?page=0&size=10
PUT    /api/notifications/{notificationId}/read
PUT    /api/notifications/{userId}/read-all
DELETE /api/notifications/{notificationId}
GET    /api/notifications/{userId}/unread-count
```

---

## 🧪 Quick Test Commands

### Test Follow Endpoint
```bash
# Follow user2 from user1
curl -X POST http://localhost:8090/api/follows/user1/follow/user2

# Check if following
curl http://localhost:8090/api/follows/user1/is-following/user2

# Get follower count
curl http://localhost:8090/api/follows/user2/follower-count
```

### Test WebSocket
```bash
# Using wscat
npm install -g wscat
wscat -c ws://localhost:8090/ws

# Send STOMP CONNECT
CONNECT
login:user1

^C

# Subscribe to notifications
SUBSCRIBE
destination:/user/user1/queue/notifications

# Publish follow event
SEND
destination:/app/follow
{"followingId":"user2","followerName":"User One"}
```

---

## ⚙️ Configuration

### Backend: `application.properties`
```properties
# WebSocket configuration
server.port=8090
spring.devtools.restart.enabled=true

# Logging
logging.level.com.lifeflow.backend=DEBUG
logging.level.org.springframework.web.socket=DEBUG
```

### Frontend: `vite.config.ts`
```typescript
// Proxy WebSocket to backend
server: {
  proxy: {
    '/ws': {
      target: 'http://localhost:8090',
      ws: true
    },
    '/api': {
      target: 'http://localhost:8090'
    }
  }
}
```

---

## 🐛 Common Debugging

### Check WebSocket Connection
```typescript
// In browser console
webSocketNotificationService.isConnected()  // true/false
```

### View Network Traffic
1. Open DevTools → Network tab
2. Filter by WebSocket (WS)
3. Monitor message frames

### Check Logs
```bash
# Backend
tail -f backend-port8090.log | grep -i "websocket\|follow\|notification"

# Frontend
Open browser console (F12) → Console tab
```

---

## 📋 Integration Checklist

When integrating with existing features:

- [ ] Import required services
- [ ] Initialize WebSocket connection on app load
- [ ] Get current user ID from auth token
- [ ] Add Follow button to profile pages
- [ ] Add notification badge to navigation
- [ ] Test follow action triggers notifications
- [ ] Verify real-time updates work
- [ ] Test with multiple browser tabs
- [ ] Handle edge cases (self-follow, network errors)
- [ ] Add error handling and retry logic

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| WebSocket connection failed | Backend not running | Start backend on port 8090 |
| 404 on follow endpoint | Endpoint not found | Check controller mapping |
| Notification not received | WebSocket disconnected | Check connection status |
| CORS error | Frontend URL not whitelisted | Update WebSocketConfig |
| Duplicate notifications | Event fired twice | Check for duplicate calls |

---

## 📞 Need Help?

1. Check [WEBSOCKET_FOLLOW_TESTING_GUIDE.md](WEBSOCKET_FOLLOW_TESTING_GUIDE.md)
2. Review implementation in [FOLLOW_NOTIFICATION_SYSTEM_GUIDE.md](FOLLOW_NOTIFICATION_SYSTEM_GUIDE.md)
3. Check API docs in [FOLLOW_NOTIFICATION_API_REFERENCE.md](FOLLOW_NOTIFICATION_API_REFERENCE.md)

---

**Last Updated**: January 27, 2026  
**Version**: 1.0
