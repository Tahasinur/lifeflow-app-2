# LifeFlow Implementation Tasks - What Needs to be Done
**Date:** January 27, 2026  
**Priority Levels:** CRITICAL | HIGH | MEDIUM | LOW

---

## CRITICAL TASKS (Blocking Release)

### 1. ⚠️ WebSocket Configuration - CRITICAL
**Current State:** Not implemented  
**Impact:** Messages delivered via polling instead of real-time  
**Effort:** 1-2 days  
**Files Needed:**
- `backend/src/main/java/com/lifeflow/backend/config/WebSocketConfig.java`
- `backend/src/main/java/com/lifeflow/backend/websocket/WebSocketHandler.java`
- `backend/src/main/java/com/lifeflow/backend/websocket/MessageHandler.java`

**Implementation Steps:**
1. Create WebSocketConfig.java with @EnableWebSocket annotation
2. Implement WebSocketHandler for message routing
3. Add WebSocket endpoints (/ws/messages, /ws/notifications)
4. Update frontend to use WebSocket instead of polling
5. Test with multiple concurrent connections

**Code Template Needed:**
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(messageHandler(), "/ws/messages")
                .addHandler(notificationHandler(), "/ws/notifications");
    }
}
```

---

### 2. ⚠️ Frontend Follow Button Integration - CRITICAL
**Current State:** Backend ready, UI not connected  
**Impact:** Follow system appears broken to users  
**Effort:** 2-3 hours  
**Files Needed:**
- Modify user profile pages to show follow button
- Create follow button component
- Wire to FollowService endpoints

**Changes Required:**
```typescript
// In ProfilePage.tsx, add:
const handleFollowClick = async () => {
  try {
    await followService.followUser(userId);
    setIsFollowing(true);
  } catch (err) {
    toast.error('Failed to follow user');
  }
};
```

**Backend Endpoints Ready:**
- `POST /api/follows/{followerId}/follow/{followingId}` ✅
- `DELETE /api/follows/{followerId}/unfollow/{followingId}` ✅
- `GET /api/follows/{userId}/follower-count` ✅

---

### 3. ⚠️ Notification Center UI - CRITICAL
**Current State:** Backend 100% complete, UI 0%  
**Impact:** Notifications created but never shown to users  
**Effort:** 3-4 hours  
**Files Needed:**
- `frontend/src/pages/NotificationsPage.tsx` (NEW)
- `frontend/src/components/NotificationBell.tsx` (NEW)
- `frontend/src/services/notificationService.ts` (NEW)

**Components Required:**
1. Notification Bell icon in header (shows unread count)
2. Notification drawer/modal showing all notifications
3. Mark as read functionality
4. Filter by type (follow, like, comment, etc.)
5. Real-time badge update

**Backend Endpoints Ready:**
- `GET /api/notifications/{userId}` ✅
- `GET /api/notifications/{userId}/unread-count` ✅
- `PUT /api/notifications/{id}/read` ✅

---

### 4. ⚠️ Notification Trigger Integration - CRITICAL
**Current State:** Notification system exists but not triggered from other services  
**Impact:** No notifications created when users interact  
**Effort:** 2-3 hours  
**Files to Modify:**
- `backend/src/main/java/com/lifeflow/backend/services/FollowService.java`
- `backend/src/main/java/com/lifeflow/backend/services/FeedService.java` (or similar)
- `backend/src/main/java/com/lifeflow/backend/controller/FeedController.java`

**Changes Needed:**
```java
// In FollowService.followUser():
public Follow followUser(String followerId, String followingId) {
    // ... existing code ...
    
    Follow saved = followRepository.save(follow);
    
    // ADD THIS:
    notificationService.createFollowerNotification(follower, following);
    
    return saved;
}
```

**All Trigger Points:**
- [ ] When user follows → Create NEW_FOLLOWER notification
- [ ] When post liked → Create POST_LIKED notification
- [ ] When post commented → Create POST_COMMENTED notification
- [ ] When reply received → Create COMMENT_REPLIED notification
- [ ] When mentioned → Create MENTION notification
- [ ] When new post from following → Create NEW_POST_FROM_FOLLOWING notification

---

## HIGH PRIORITY TASKS (Complete Soon)

### 5. 🔧 Complete Settings UI Integration
**Current State:** Backend complete (70%), Frontend incomplete (40%)  
**Impact:** Users can't access their settings  
**Effort:** 3-4 hours  
**Files to Modify:**
- `frontend/src/pages/SettingsPage.tsx` - Complete implementation
- `frontend/src/services/settingsService.ts` - Create service

**UI Sections Needed:**
- [ ] Account settings (email, password)
- [ ] Notification preferences
- [ ] Privacy settings
- [ ] Workspace settings
- [ ] UI theme settings (dark/light)

**Backend Endpoints Available:**
- `GET /api/settings/preferences` ✅
- `PUT /api/settings/preferences` ✅
- `GET /api/settings/workspace` ✅
- `PUT /api/settings/workspace` ✅

---

### 6. 🔧 Frontend Follow Lists Display
**Current State:** Backend ready, UI missing  
**Impact:** Can't see who follows you or who you follow  
**Effort:** 2-3 hours  
**Files Needed:**
- `frontend/src/pages/FollowersPage.tsx` (NEW)
- `frontend/src/pages/FollowingPage.tsx` (NEW)
- `frontend/src/components/FollowersList.tsx` (NEW)

**Backend Endpoints Ready:**
- `GET /api/follows/{userId}/followers` ✅
- `GET /api/follows/{userId}/following` ✅
- `GET /api/follows/{userId}/follower-count` ✅

---

### 7. 🔧 User Search Implementation
**Current State:** Backend 80%, Frontend 30%  
**Impact:** Users can't find other users to follow  
**Effort:** 2 hours  
**Files to Modify:**
- Complete `frontend/src/services/userService.ts`
- Create `frontend/src/components/UserSearchResults.tsx`
- Add search to sidebar or dedicated page

**Backend Endpoints Ready:**
- `GET /api/users/search?query=...` ✅
- `GET /api/users/by-email` ✅

---

## MEDIUM PRIORITY TASKS (Complete Before Launch)

### 8. 📝 Message Editing UI
**Current State:** Backend complete, UI missing  
**Impact:** Users can't edit typos in messages  
**Effort:** 1.5 hours  
**Files Needed:**
- Add edit button to message bubble component
- Create message edit modal

**Backend Endpoint Ready:**
- `PUT /api/messages/{messageId}` ✅

---

### 9. 📝 Conversation Management UI
**Current State:** Backend complete, UI partial  
**Impact:** Can't rename groups, leave conversations  
**Effort:** 2 hours  
**Files to Modify:**
- `frontend/src/pages/InboxPage.tsx` - Add context menu
- Create `frontend/src/components/ConversationSettings.tsx`

**Backend Endpoints Ready:**
- `PATCH /api/messages/conversations/{id}` ✅
- `DELETE /api/messages/conversations/{id}` ✅
- `POST /api/messages/conversations/{id}/archive` ✅

---

### 10. 📝 Message Attachments UI
**Current State:** Backend complete, UI basic  
**Impact:** File uploads available but UI needs improvement  
**Effort:** 1-2 hours  
**Files to Modify:**
- Enhance attachment display in InboxPage
- Add progress indicator for uploads
- Add download functionality

**Backend Endpoint Ready:**
- `POST /api/messages/{messageId}/attachments` ✅

---

## LOW PRIORITY TASKS (Nice to Have)

### 11. 💡 User Blocking System
**Current State:** Not implemented  
**Impact:** Users can't prevent unwanted contact  
**Effort:** 2-3 days  
**Required:**
- Create BlockedUser model
- Create BlockService
- Create BlockController
- Create BlockRepository
- Add UI for blocking users
- Filter conversations/messages from blocked users

**Database Model Needed:**
```java
@Entity
public class BlockedUser {
    String id;
    User blocker;
    User blockedUser;
    LocalDateTime createdAt;
    String reason;
}
```

---

### 12. 💡 Report System
**Current State:** Not implemented  
**Impact:** Can't report inappropriate content  
**Effort:** 2-3 days  
**Required:**
- Create Report model
- Create ReportService
- Create ReportController
- Admin dashboard to view reports

---

### 13. 💡 Advanced Notifications
**Current State:** Basic notifications only  
**Impact:** Limited notification experience  
**Effort:** 1-2 days  
**Enhancements:**
- Email notifications
- Browser push notifications
- Batch notifications
- Notification scheduling

---

### 14. 💡 Privacy Controls
**Current State:** Not implemented  
**Impact:** Limited privacy options  
**Effort:** 2-3 days  
**Features:**
- Private account mode
- Control who can message
- Control who can see profile
- Block by default

---

## QUICK WINS (Easy, High Value)

### Quick Win 1: Follower Count Display
**Effort:** 30 minutes  
**Impact:** Users can see social proof  
**Changes:**
- Add `GET /api/follows/{userId}/follower-count` call
- Display count on profile page

---

### Quick Win 2: Mute Button on Follow
**Effort:** 30 minutes  
**Impact:** Control feed without unfollowing  
**Changes:**
- Add mute option to follow menu
- Wire to `POST /api/follows/{userId}/mute/{targetId}`

---

### Quick Win 3: Search in Messages
**Effort:** 1 hour  
**Impact:** Find old messages quickly  
**Changes:**
- Add search box to InboxPage
- Filter conversations by search query

---

### Quick Win 4: Unread Conversation Count
**Effort:** 30 minutes  
**Impact:** Know you have unread messages  
**Changes:**
- Add badge to Inbox in sidebar
- Show unread count from backend

---

## DATABASE & DevOps Tasks

### 15. 🗄️ Create Migration Scripts
**Current State:** Models exist, migrations unknown  
**Impact:** Database schema deployment  
**Effort:** 2-3 hours  
**Files Needed:**
- `backend/src/main/resources/db/migration/V*.sql`
- Migrations for:
  - Conversations table
  - Messages table
  - Follows table
  - Notifications table
  - All relationships and indexes

---

### 16. 🗄️ Add Database Indexes
**Current State:** Some indexes exist  
**Impact:** Query performance  
**Effort:** 1-2 hours  
**Recommended Indexes:**
```sql
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
```

---

## TESTING Tasks

### 17. 🧪 Integration Tests
**Current State:** Unknown  
**Impact:** Verify features work together  
**Effort:** 2-3 days  
**Test Scenarios:**
- [ ] User A follows User B → Notification created
- [ ] User A sends message to User B → Message stored
- [ ] User A reacts to User B's message → Reaction stored
- [ ] User A blocks User B → Conversation filtered
- [ ] User A searches for User B → Results show

**Files Needed:**
- `backend/src/test/java/com/lifeflow/backend/integration/` (New test directory)
- MessagingIntegrationTest.java
- FollowIntegrationTest.java
- NotificationIntegrationTest.java

---

### 18. 🧪 End-to-End Tests
**Current State:** E2E_TEST_RUNNER.ps1 exists  
**Impact:** Verify full user workflows  
**Effort:** 1-2 days  
**Test Scenarios:**
- [ ] Complete messaging workflow
- [ ] Complete follow workflow
- [ ] Complete notification workflow

---

## DOCUMENTATION Tasks

### 19. 📚 API Documentation
**Current State:** Partial  
**Impact:** Developer onboarding  
**Effort:** 1-2 hours  
**Needed:**
- OpenAPI/Swagger documentation
- Request/response examples
- Error code documentation
- Authentication documentation

---

## Summary by Effort

| Effort | Count | Total Effort |
|--------|-------|--------------|
| < 1 hour | 4 | 2 hours |
| 1-2 hours | 8 | 10 hours |
| 2-4 hours | 5 | 15 hours |
| 1-2 days | 4 | 6 days |
| 2-3 days | 4 | 10 days |

**Total: ~40-45 hours (~5-6 days of full-time work)**

---

## Summary by Priority

| Priority | Count | Total Effort |
|----------|-------|--------------|
| CRITICAL | 4 | 8-10 days |
| HIGH | 4 | 8-10 hours |
| MEDIUM | 4 | 6-8 hours |
| LOW | 4 | 8-10 days |
| QUICK WIN | 4 | 2-3 hours |

**To Launch MVP:** 1-2 weeks (Finish CRITICAL + HIGH + QUICK WIN)

---

## Recommended Implementation Order

### Week 1 (CRITICAL - 3-4 days)
1. WebSocket implementation (1-2 days)
2. Frontend Follow button wiring (2-3 hours)
3. Notification Center UI (3-4 hours)
4. Notification Trigger integration (2-3 hours)

### Week 1-2 (HIGH - 2-3 days)
5. Settings UI completion (3-4 hours)
6. Follow lists display (2-3 hours)
7. User search implementation (2 hours)
8. Integration testing (2-3 days)

### Post-Launch (MEDIUM + LOW)
- Remaining tasks based on user feedback

---

## Success Criteria

### Before MVP Launch
- [ ] All CRITICAL tasks complete
- [ ] All HIGH priority tasks complete
- [ ] Integration tests pass 100%
- [ ] E2E tests pass 100%
- [ ] No critical bugs in staging

### For v1.1 Release
- [ ] All MEDIUM priority tasks complete
- [ ] User search fully working
- [ ] Settings fully functional

### For v2.0 Release
- [ ] All LOW priority tasks complete
- [ ] User blocking implemented
- [ ] Report system working
- [ ] Privacy controls available

---

## Notes

1. **Dependencies:** Some tasks depend on others (WebSocket before real-time notifications)
2. **Effort Estimate:** ±20% accuracy. Actual may vary based on bugs/complexity
3. **Resource:** Assumes 1 developer working full-time
4. **Code Quality:** All code should follow existing patterns in codebase
5. **Testing:** All new code should have 80%+ test coverage

---

Generated: January 27, 2026  
Last Updated: Implementation Plan Complete  
Status: Ready for Sprint Planning
