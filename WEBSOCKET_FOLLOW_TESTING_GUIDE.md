# WebSocket Configuration & Follow Button Integration - Testing Guide

## 🎯 Overview

This document provides comprehensive testing procedures for the newly implemented WebSocket configuration and Follow button integration that completes the social loop in the LifeFlow application.

## ✅ Implementation Summary

### Backend Components Created

1. **WebSocketConfig.java** (`backend/src/main/java/com/lifeflow/backend/config/`)
   - Enables STOMP protocol messaging
   - Configures message broker (/user, /topic)
   - Registers WebSocket endpoints (/ws, /ws/notifications, /ws/social)
   - Allows connections from localhost:3000 and localhost:5173

2. **WebSocketEventHandler.java** (`backend/src/main/java/com/lifeflow/backend/event/`)
   - Tracks user connections/disconnections
   - Broadcasts user status changes
   - Maintains map of connected users

3. **NotificationWebSocketController.java** (`backend/src/main/java/com/lifeflow/backend/controller/`)
   - Handles follow events via WebSocket
   - Handles unfollow events via WebSocket
   - Provides unread notification counts
   - Supports user subscriptions to notifications

### Frontend Components Created

1. **followService.ts** (`frontend/src/services/`)
   - REST API integration for follow operations
   - Methods: followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount
   - Methods: getFollowers, getFollowing, muteUser, unmuteUser, getMutedFollows

2. **webSocketNotificationService.ts** (`frontend/src/services/`)
   - WebSocket client connection management
   - Notification subscription handling
   - Follow/unfollow event publishing
   - Status change callbacks
   - Unread count retrieval

3. **FollowButton.tsx** (`frontend/src/components/`)
   - Follow/unfollow UI component
   - Integrates with followService
   - Publishes WebSocket events
   - Handles loading and error states

4. **NotificationBadge.tsx** (`frontend/src/components/`)
   - Real-time notification display
   - Unread count badge
   - Notification dropdown menu
   - Toast notifications for follow events

### UI Integrations

1. **UserProfilePage.tsx** - Updated with:
   - FollowButton component
   - Follower/following counts display
   - WebSocket connection initialization
   - Follow count updates on state change

2. **Topbar.tsx** - Updated with:
   - NotificationBadge component
   - User ID retrieval
   - Notification bell icon with count badge

---

## 🧪 Testing Procedures

### Phase 1: Backend WebSocket Configuration Testing

#### Test 1.1: Application Startup
```
Steps:
1. Start backend application: mvn spring-boot:run
2. Check logs for WebSocket initialization

Expected Output:
- No errors in logs
- WebSocket endpoints registered
- Application starts successfully on port 8090
```

#### Test 1.2: WebSocket Endpoint Availability
```
Steps:
1. Use curl or Postman to test WebSocket endpoints:
   
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     http://localhost:8090/ws

Expected Output:
- 101 Switching Protocols response
- WebSocket connection established
```

#### Test 1.3: STOMP Protocol
```
Steps:
1. Connect using STOMP client (e.g., wscat, Postman)
2. Send CONNECT frame
3. Subscribe to /user/queue/notifications

Command (using wscat):
  wscat -c ws://localhost:8090/ws

Expected Output:
- Successful WebSocket connection
- CONNECTED frame received
- Ready to receive messages
```

---

### Phase 2: Follow System Testing

#### Test 2.1: Get Follow Status
```
Steps:
1. Use REST endpoint to check if user1 is following user2
   GET http://localhost:8090/api/follows/user1/is-following/user2

Expected Output:
{
  "isFollowing": false
}
```

#### Test 2.2: Follow User
```
Steps:
1. Call follow endpoint
   POST http://localhost:8090/api/follows/user1/follow/user2

Expected Output:
{
  "success": true,
  "message": "Successfully followed user",
  "follow": {
    "id": "...",
    "follower": { "id": "user1", "name": "User 1" },
    "following": { "id": "user2", "name": "User 2" },
    "createdAt": "2026-01-27T..."
  }
}
```

#### Test 2.3: Get Follower Count
```
Steps:
1. Get follower count for a user
   GET http://localhost:8090/api/follows/user2/follower-count

Expected Output:
{
  "count": 1
}
```

#### Test 2.4: Get Following Count
```
Steps:
1. Get following count for a user
   GET http://localhost:8090/api/follows/user1/following-count

Expected Output:
{
  "count": 1
}
```

#### Test 2.5: Unfollow User
```
Steps:
1. Unfollow a user
   DELETE http://localhost:8090/api/follows/user1/unfollow/user2

Expected Output:
{
  "success": true,
  "message": "Successfully unfollowed user"
}
```

---

### Phase 3: WebSocket Notification Testing

#### Test 3.1: Follow Notification
```
Steps:
1. Open two browser windows or tabs
2. Login as different users (user1 and user2)
3. Connect to WebSocket in both windows
4. In user1's window, click Follow on user2's profile
5. Verify WebSocket message in user2's window

Expected Flow:
- user1 clicks Follow button
- FollowButton component sends REST request
- publishFollowEvent() called on WebSocket service
- Message published to /app/follow
- NotificationWebSocketController receives message
- Notification sent to /user/user2/queue/notifications
- user2 receives real-time notification
- Toast notification appears for user2
- Notification badge increments for user2
```

#### Test 3.2: Unfollow Notification
```
Steps:
1. Same setup as Test 3.1
2. In user1's window, click Unfollow on user2's profile
3. Verify unfollow notification in user2's window

Expected Output:
- Unfollow event published via WebSocket
- Notification received by user2
- Notification displayed in dropdown
```

#### Test 3.3: Multiple Simultaneous Connections
```
Steps:
1. Open 3+ browser windows with different users
2. Have user1 follow user2 and user3
3. Have user2 follow user1 and user3
4. Verify all users receive proper notifications

Expected Output:
- Each user receives only notifications for themselves
- No message leaking between users
- All connections remain stable
```

---

### Phase 4: Frontend UI Testing

#### Test 4.1: Follow Button Component
```
Steps:
1. Navigate to any user's profile
2. Click Follow button
3. Verify button state changes to "Following"
4. Click again to Unfollow
5. Verify button returns to "Follow" state

Expected Output:
- Button text changes appropriately
- Button color changes (blue -> red when following)
- Toast notifications appear for success/error
- Follower count updates immediately
```

#### Test 4.2: Notification Badge
```
Steps:
1. Navigate to any page with Topbar
2. Locate bell icon in top right
3. Have another user follow you
4. Verify badge count increments
5. Click bell icon to open notification dropdown

Expected Output:
- Bell icon shows with red badge count
- Badge count increments on new notifications
- Dropdown displays list of recent notifications
- Each notification shows timestamp
- Clicking notification clears it from list
```

#### Test 4.3: Follower/Following Stats
```
Steps:
1. Navigate to a user profile
2. Verify follower count displayed
3. Verify following count displayed
4. Follow the user
5. Refresh page
6. Verify follower count increased

Expected Output:
- Initial counts are correct
- Counts update after follow/unfollow
- Persistence verified after refresh
```

---

### Phase 5: Integration Testing

#### Test 5.1: End-to-End Follow Flow
```
Steps:
1. Open two browser windows (User A and User B)
2. Navigate to User B's profile in User A's window
3. Click Follow button
4. Verify in User B's window:
   - Notification appears
   - Toast notification shown
   - Badge count increments
5. Verify in User A's window:
   - Button shows "Following"
   - Follower count visible on User B's profile
6. Click Unfollow button
7. Verify User B receives unfollow notification

Expected Result:
- Complete social loop functional
- Real-time updates working
- No errors in console
- Smooth user experience
```

#### Test 5.2: Rapid Follow/Unfollow
```
Steps:
1. Click Follow button multiple times rapidly
2. Verify system handles correctly

Expected Output:
- No duplicate notifications
- Proper state management
- No errors or exceptions
```

#### Test 5.3: Session Management
```
Steps:
1. Login and navigate to profile
2. Close browser window
3. Open new window and login again
4. Verify WebSocket reconnection
5. Verify no notification loss

Expected Output:
- Graceful disconnection
- Successful reconnection
- All functionality restored
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

In `application.properties` or `application.yml`:
```properties
logging.level.org.springframework.web.socket=DEBUG
logging.level.com.lifeflow.backend.event=DEBUG
logging.level.com.lifeflow.backend.controller=DEBUG
```

### Browser Developer Tools

1. **Network Tab**: Monitor WebSocket connections
   - Look for ws:// protocol
   - Monitor message frames

2. **Console Tab**: Check for JavaScript errors
   - WebSocket errors
   - Service errors
   - Component errors

3. **Application Storage**: Check localStorage
   - Verify token storage
   - Check user data

### Testing Tools

- **Postman**: Test REST endpoints
- **wscat**: Test WebSocket manually
- **Chrome DevTools**: Monitor WebSocket frames
- **Network Monitor**: Track all requests

---

## ⚠️ Common Issues & Solutions

### Issue 1: WebSocket Connection Fails
```
Symptom: WebSocket connection error in console

Solutions:
1. Verify backend is running on port 8090
2. Check CORS configuration in WebSocketConfig
3. Verify frontend is on localhost:3000 or localhost:5173
4. Check network/firewall settings
```

### Issue 2: Notifications Not Received
```
Symptom: Follow action succeeds but no notification appears

Solutions:
1. Verify WebSocket is connected (check browser DevTools)
2. Verify user is logged in with correct userId
3. Check backend logs for errors
4. Verify notification subscription active
5. Confirm user IDs match in both REST and WebSocket calls
```

### Issue 3: Duplicate Notifications
```
Symptom: Same notification appears multiple times

Solutions:
1. Check if WebSocket event is triggered multiple times
2. Verify notification deduplication logic
3. Check REST endpoint not called simultaneously with WebSocket
```

### Issue 4: Follower Count Not Updating
```
Symptom: Count doesn't change after follow/unfollow

Solutions:
1. Verify API response received successfully
2. Check follow count API endpoint working
3. Verify state update in component
4. Confirm page refresh works (API is correct)
```

---

## 📊 Performance Testing

### Load Testing WebSocket
```
Steps:
1. Connect 100+ users simultaneously
2. Have each user publish follow events
3. Monitor message throughput
4. Check server memory/CPU usage

Expected Performance:
- Latency < 100ms per notification
- No message loss
- Server stable under load
```

### Connection Stability
```
Steps:
1. Keep connection open for 24+ hours
2. Monitor for disconnects or errors
3. Test network interruption recovery

Expected Behavior:
- Automatic reconnection
- Message buffering during downtime
- Clean recovery
```

---

## ✨ Success Criteria

All tests pass when:

- ✅ WebSocket connections establish successfully
- ✅ Follow/unfollow operations complete without errors
- ✅ Real-time notifications deliver instantly
- ✅ UI updates reflect changes immediately
- ✅ No console errors or warnings
- ✅ All user interactions work smoothly
- ✅ Follower/following counts are accurate
- ✅ Multiple users can interact without interference
- ✅ Application handles disconnections gracefully
- ✅ Performance is responsive (< 200ms latency)

---

## 📝 Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Production]

Test Results:
- Backend WebSocket: [ ] PASS [ ] FAIL
- Follow System: [ ] PASS [ ] FAIL
- WebSocket Notifications: [ ] PASS [ ] FAIL
- Frontend UI: [ ] PASS [ ] FAIL
- Integration Flow: [ ] PASS [ ] FAIL

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Additional notes]

Signed: _______________
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Load tests pass with acceptable performance
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] WebSocket endpoints accessible
- [ ] CORS configuration updated for production domain
- [ ] Token validation working
- [ ] Database migrations executed
- [ ] Backup created
- [ ] Rollback plan in place
- [ ] Monitoring/alerting configured
- [ ] Documentation updated
- [ ] Team notified

---

## 📞 Support & Escalation

If issues persist after troubleshooting:

1. Check logs: `tail -f backend-port8090.log`
2. Verify database connectivity
3. Check network/firewall settings
4. Review recent code changes
5. Escalate to development team with logs/screenshots

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Status**: Ready for Testing

