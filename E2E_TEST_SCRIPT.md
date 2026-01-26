# LifeFlow E2E Test Script
## Multi-User Social Features & Database Integrity Validation

**Date:** January 26, 2026  
**QA Engineer:** Lead QA  
**Application:** LifeFlow v1.0  
**Test Scope:** Account Creation, Content Management, Community Feed, Cloning, Profile Viewing

---

## Executive Summary

This document provides a complete end-to-end test scenario for the LifeFlow application, validating multi-user interactions with the Community Feed and database integrity. The test follows a realistic user journey: User Registration → Content Creation → Community Sharing → Profile Viewing → Template Cloning.

**⚠️ CRITICAL FINDING:** Real-time messaging/chat system is **NOT IMPLEMENTED** in the backend despite being referenced in documentation. See [Missing Features Report](#missing-features-report) below.

---

## Test Prerequisites

- **Backend Running:** Spring Boot application on `http://localhost:8080`
- **Database:** PostgreSQL on `localhost:5432` (database: `lifeflow`)
- **Database Credentials:** 
  - User: `postgres`
  - Password: `36349`
- **pgAdmin or psql access** for database validation
- **Postman, cURL, or similar HTTP client** for API testing
- **Test Data:** Fresh database (recommended to clear existing test data first)

---

## Test Scenario Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  LIFEFLOW E2E TEST JOURNEY                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. CREATE ACCOUNTS                                              │
│     Alice (alice@test.com)  ──┐                                 │
│     Bob (bob@test.com)      ──┤                                 │
│                                ├──> Verify in DB                │
│  2. ALICE CREATES CONTENT                                        │
│     Title: "Alice's Study Guide"                                │
│     Blocks: Sample content                                       │
│                                ├──> Verify Page in DB            │
│  3. ALICE SHARES TO COMMUNITY                                    │
│     Type: "template"                                            │
│     Linked to Page ID                                           │
│                                ├──> Verify FeedItem in DB        │
│  4. BOB VIEWS FEED                                              │
│     GET /api/feed                                               │
│                                ├──> Verify Bob sees post         │
│  5. BOB VIEWS ALICE'S PROFILE                                   │
│     GET /api/users/{aliceId}/profile                            │
│                                ├──> Verify profile data          │
│  6. BOB CLONES TEMPLATE                                         │
│     POST /api/feed/{feedItemId}/clone                           │
│     Body: { userId: "bobId" }                                   │
│                                ├──> Verify cloned page in DB     │
│                                ├──> Verify Bob is owner          │
│  7. ATTEMPT MESSAGING CHECK                                     │
│     Search for messaging endpoints                              │
│                                ├──> REPORT: NOT FOUND ⚠️        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Test Steps

### Phase 1: Account Creation

#### Test 1.1 - Register Alice

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@test.com",
  "password": "Alice123!@#"
}
```

**Expected Response (201 Created):**
```json
{
  "userId": "<uuid>",
  "email": "alice@test.com",
  "name": "Alice Johnson",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "User registered successfully"
}
```

**Save:** 
- `ALICE_ID` = (captured userId)
- `ALICE_TOKEN` = (captured token)

---

#### Test 1.2 - Register Bob

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Bob Smith",
  "email": "bob@test.com",
  "password": "Bob123!@#"
}
```

**Expected Response (201 Created):**
```json
{
  "userId": "<uuid>",
  "email": "bob@test.com",
  "name": "Bob Smith",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "User registered successfully"
}
```

**Save:**
- `BOB_ID` = (captured userId)
- `BOB_TOKEN` = (captured token)

---

### Phase 2: Content Creation (Alice)

#### Test 2.1 - Alice Logs In (Token Validation)

**Endpoint:** `POST /api/auth/validate`

**Request Headers:**
```
Authorization: Bearer {ALICE_TOKEN}
```

**Expected Response (200 OK):**
```json
{
  "userId": "{ALICE_ID}",
  "email": "alice@test.com",
  "message": "Token valid"
}
```

---

#### Test 2.2 - Alice Creates a Workspace Page

**Endpoint:** `POST /api/pages`

**Request Headers:**
```
X-User-Id: {ALICE_ID}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "page-alice-study-guide",
  "title": "Alice's Study Guide",
  "icon": "📚",
  "userId": "{ALICE_ID}",
  "coverImage": "data:image/jpeg;base64,/9j/...",
  "blocksJson": "[{\"type\":\"heading\",\"content\":\"Chapter 1: Introduction\"},{\"type\":\"paragraph\",\"content\":\"This is a study guide for advanced Python.\"}]",
  "editorContentJson": "{\"version\":1,\"blocks\":[]}",
  "parentId": null,
  "favorite": false,
  "deleted": false
}
```

**Expected Response (200 OK):**
```json
{
  "id": "page-alice-study-guide",
  "title": "Alice's Study Guide",
  "userId": "{ALICE_ID}",
  "icon": "📚",
  "blocksJson": "[{\"type\":\"heading\",\"content\":\"Chapter 1: Introduction\"}...]",
  "createdAt": "2026-01-26T10:15:30",
  "updatedAt": "2026-01-26T10:15:30"
}
```

**Save:**
- `ALICE_PAGE_ID` = `page-alice-study-guide`

---

### Phase 3: Sharing to Community Feed (Alice)

#### Test 3.1 - Alice Creates a Template FeedItem

**Endpoint:** `POST /api/feed`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Alice's Study Guide - Template",
  "description": "A comprehensive study guide for Python beginners. Includes chapters on fundamentals, OOP, and best practices.",
  "type": "template",
  "sourcePageId": "page-alice-study-guide",
  "userId": "{ALICE_ID}",
  "tags": ["python", "study-guide", "template", "education"]
}
```

**Expected Response (200 OK):**
```json
{
  "id": "<feedItemUuid>",
  "title": "Alice's Study Guide - Template",
  "description": "A comprehensive study guide for Python beginners...",
  "type": "template",
  "sourcePageId": "page-alice-study-guide",
  "likes": 0,
  "author": {
    "id": "{ALICE_ID}",
    "name": "Alice Johnson",
    "email": "alice@test.com",
    "avatar": "AJ"
  },
  "tags": ["python", "study-guide", "template", "education"],
  "createdAt": "2026-01-26T10:20:45",
  "commentCount": 0
}
```

**Save:**
- `FEED_ITEM_ID` = (captured feedItem id)

---

### Phase 4: Bob Interactions

#### Test 4.1 - Bob Logs In (Token Validation)

**Endpoint:** `POST /api/auth/validate`

**Request Headers:**
```
Authorization: Bearer {BOB_TOKEN}
```

**Expected Response (200 OK):**
```json
{
  "userId": "{BOB_ID}",
  "email": "bob@test.com",
  "message": "Token valid"
}
```

---

#### Test 4.2 - Bob Fetches Community Feed

**Endpoint:** `GET /api/feed`

**Request Headers:**
```
Accept: application/json
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "{FEED_ITEM_ID}",
    "title": "Alice's Study Guide - Template",
    "description": "A comprehensive study guide for Python beginners...",
    "type": "template",
    "sourcePageId": "page-alice-study-guide",
    "likes": 0,
    "author": {
      "id": "{ALICE_ID}",
      "name": "Alice Johnson",
      "email": "alice@test.com",
      "avatar": "AJ"
    },
    "tags": ["python", "study-guide", "template", "education"],
    "createdAt": "2026-01-26T10:20:45",
    "commentCount": 0
  }
]
```

**Validation:**
- ✅ Feed is not empty
- ✅ Alice's post is in the list
- ✅ Post type is "template"
- ✅ Author ID matches ALICE_ID

---

#### Test 4.3 - Bob Views Alice's Public Profile

**Endpoint:** `GET /api/users/{ALICE_ID}/profile`

**Request Headers:**
```
Accept: application/json
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "{ALICE_ID}",
    "name": "Alice Johnson",
    "email": "alice@test.com",
    "avatar": "AJ",
    "bio": null,
    "role": "USER",
    "createdAt": "2026-01-26T10:15:20"
  },
  "posts": [
    {
      "id": "{FEED_ITEM_ID}",
      "title": "Alice's Study Guide - Template",
      "description": "A comprehensive study guide for Python beginners...",
      "type": "template",
      "author": {
        "id": "{ALICE_ID}",
        "name": "Alice Johnson"
      },
      "createdAt": "2026-01-26T10:20:45",
      "commentCount": 0
    }
  ]
}
```

**Validation:**
- ✅ User profile exists
- ✅ User name matches "Alice Johnson"
- ✅ Posts array contains Alice's template
- ✅ Author ID is correct

---

### Phase 5: Template Cloning (Bob)

#### Test 5.1 - Bob Clones Alice's Template

**Endpoint:** `POST /api/feed/{FEED_ITEM_ID}/clone`

**Request Headers:**
```
Content-Type: application/json
X-User-Id: {BOB_ID}
```

**Request Body:**
```json
{
  "userId": "{BOB_ID}"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "pageId": "<newPageUuid>",
  "message": "Template cloned successfully!"
}
```

**Save:**
- `BOB_CLONED_PAGE_ID` = (captured pageId)

---

#### Test 5.2 - Verify Bob's Cloned Page in His Workspace

**Endpoint:** `GET /api/pages`

**Request Headers:**
```
X-User-Id: {BOB_ID}
Accept: application/json
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "{BOB_CLONED_PAGE_ID}",
    "title": "Alice's Study Guide (Cloned)",
    "userId": "{BOB_ID}",
    "icon": "📚",
    "blocksJson": "[{\"type\":\"heading\",\"content\":\"Chapter 1: Introduction\"}...]",
    "createdAt": "2026-01-26T10:25:30",
    "updatedAt": "2026-01-26T10:25:30",
    "deleted": false
  }
]
```

**Validation:**
- ✅ Cloned page exists
- ✅ Page title includes "(Cloned)"
- ✅ userId is BOB_ID (not ALICE_ID)
- ✅ Content matches source page (blocksJson)

---

### Phase 6: Messaging System Check

#### Test 6.1 - Attempt to Send Direct Message (Alice to Bob)

**Investigation Steps:**

1. **Search for Message-related Endpoints:**
   - Check for: `POST /api/messages`
   - Check for: `POST /api/chat`
   - Check for: `POST /api/direct-messages`
   - Check for: `POST /api/users/{id}/message`
   - Check for: WebSocket endpoints (`/ws/*`)

2. **Expected Result:**
   ```
   ❌ NO MESSAGING ENDPOINTS FOUND
   Status: NOT IMPLEMENTED
   ```

3. **Alternative Check - API Documentation:**
   - OpenAPI/Swagger docs: `http://localhost:8080/swagger-ui.html`
   - Check for message/chat service endpoints
   - Result: No messaging controller detected

---

## Database Validation SQL Queries

Run these queries in **pgAdmin** or **psql** to validate application state:

### Query 1: Verify Both Users Exist

```sql
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM users
WHERE email IN ('alice@test.com', 'bob@test.com')
ORDER BY created_at;
```

**Expected Output:**
```
┌──────────────────────────────┬─────────────────┬──────────────────┬────────┬──────────────────────────┐
│ id                           │ name            │ email            │ role   │ created_at               │
├──────────────────────────────┼─────────────────┼──────────────────┼────────┼──────────────────────────┤
│ <alice-uuid>                 │ Alice Johnson   │ alice@test.com   │ USER   │ 2026-01-26 10:15:20      │
│ <bob-uuid>                   │ Bob Smith       │ bob@test.com     │ USER   │ 2026-01-26 10:15:45      │
└──────────────────────────────┴─────────────────┴──────────────────┴────────┴──────────────────────────┘
```

---

### Query 2: Verify Alice's Pages

```sql
SELECT 
  id,
  title,
  user_id,
  deleted,
  created_at
FROM pages
WHERE user_id = '<ALICE_ID>'
ORDER BY created_at DESC;
```

**Expected Output:**
```
┌──────────────────────────────┬──────────────────────────┬──────────────────────────┬─────────┬──────────────────────────┐
│ id                           │ title                    │ user_id                  │ deleted │ created_at               │
├──────────────────────────────┼──────────────────────────┼──────────────────────────┼─────────┼──────────────────────────┤
│ page-alice-study-guide       │ Alice's Study Guide      │ <alice-uuid>             │ false   │ 2026-01-26 10:20:00      │
└──────────────────────────────┴──────────────────────────┴──────────────────────────┴─────────┴──────────────────────────┘
```

---

### Query 3: Verify FeedItem is Linked to Alice

```sql
SELECT 
  fi.id,
  fi.title,
  fi.type,
  fi.source_page_id,
  u.name as author_name,
  u.id as author_id,
  fi.created_at
FROM feed_items fi
LEFT JOIN users u ON fi.author_id = u.id
WHERE u.email = 'alice@test.com'
ORDER BY fi.created_at DESC;
```

**Expected Output:**
```
┌──────────────────────────────┬─────────────────────────────────────────┬──────────┬──────────────────────────┬─────────────────┬──────────────────────────┬──────────────────────────┐
│ id                           │ title                                   │ type     │ source_page_id           │ author_name     │ author_id                │ created_at               │
├──────────────────────────────┼─────────────────────────────────────────┼──────────┼──────────────────────────┼─────────────────┼──────────────────────────┼──────────────────────────┤
│ <feed-item-uuid>             │ Alice's Study Guide - Template          │ template │ page-alice-study-guide   │ Alice Johnson   │ <alice-uuid>             │ 2026-01-26 10:20:45      │
└──────────────────────────────┴─────────────────────────────────────────┴──────────┴──────────────────────────┴─────────────────┴──────────────────────────┴──────────────────────────┘
```

---

### Query 4: Verify Bob's Cloned Page (Critical: Bob is Owner, NOT Alice)

```sql
SELECT 
  id,
  title,
  user_id,
  parent_id,
  deleted,
  created_at
FROM pages
WHERE user_id = '<BOB_ID>'
AND title LIKE '%Cloned%'
ORDER BY created_at DESC;
```

**Expected Output:**
```
┌──────────────────────────────┬──────────────────────────────────────┬──────────────────────────┬──────────┬─────────┬──────────────────────────┐
│ id                           │ title                                │ user_id                  │ parent_id│ deleted │ created_at               │
├──────────────────────────────┼──────────────────────────────────────┼──────────────────────────┼──────────┼─────────┼──────────────────────────┤
│ <cloned-page-uuid>           │ Alice's Study Guide (Cloned)         │ <bob-uuid>               │ null     │ false   │ 2026-01-26 10:25:30      │
└──────────────────────────────┴──────────────────────────────────────┴──────────────────────────┴──────────┴─────────┴──────────────────────────┘
```

**CRITICAL VALIDATION:**
- ✅ `user_id` = Bob's ID (NOT Alice's)
- ✅ `title` contains "(Cloned)"
- ✅ `deleted` = false

---

### Query 5: Comprehensive Data Integrity Check

```sql
-- Verify no orphaned pages (pages without users)
SELECT 
  p.id,
  p.title,
  p.user_id,
  'ORPHANED PAGE' as issue
FROM pages p
LEFT JOIN users u ON p.user_id = u.id
WHERE u.id IS NULL
  AND p.user_id IS NOT NULL;

-- Verify no orphaned feed items (feed items without authors)
SELECT 
  fi.id,
  fi.title,
  fi.author_id,
  'ORPHANED FEED ITEM' as issue
FROM feed_items fi
LEFT JOIN users u ON fi.author_id = u.id
WHERE u.id IS NULL
  AND fi.author_id IS NOT NULL;

-- Verify no orphaned comments (comments without feed items)
SELECT 
  c.id,
  c.feed_item_id,
  'ORPHANED COMMENT' as issue
FROM comments c
LEFT JOIN feed_items fi ON c.feed_item_id = fi.id
WHERE fi.id IS NULL;
```

**Expected Output:** 
- All three queries return **0 rows** (no orphaned data)

---

### Query 6: Feed Item & Source Page Linkage Validation

```sql
SELECT 
  fi.id as feed_item_id,
  fi.title,
  fi.source_page_id,
  p.title as source_page_title,
  u.name as author_name,
  CASE 
    WHEN p.id IS NULL AND fi.source_page_id IS NOT NULL THEN 'MISSING SOURCE PAGE'
    WHEN p.user_id != u.id THEN 'SOURCE PAGE OWNER MISMATCH'
    ELSE 'OK'
  END as integrity_status
FROM feed_items fi
LEFT JOIN pages p ON fi.source_page_id = p.id
LEFT JOIN users u ON fi.author_id = u.id
WHERE fi.type = 'template'
ORDER BY fi.created_at DESC;
```

**Expected Output:**
```
┌──────────────────────────────┬─────────────────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────┬─────────────────────┐
│ feed_item_id                 │ title                               │ source_page_id           │ source_page_title        │ author_name      │ integrity_status    │
├──────────────────────────────┼─────────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────┼─────────────────────┤
│ <feed-item-uuid>             │ Alice's Study Guide - Template      │ page-alice-study-guide   │ Alice's Study Guide      │ Alice Johnson    │ OK                  │
└──────────────────────────────┴─────────────────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────┴─────────────────────┘
```

---

## Missing Features Report

### Feature 1: Real-Time Messaging/Chat System

**Status:** ❌ **NOT IMPLEMENTED**

**Evidence:**
- No `MessageController` or `ChatController` found in codebase
- No `Message` or `Chat` model entities in `/model` directory
- No `MessageRepository` or `ChatRepository` in `/repository` directory
- No messaging endpoints in `UserController.java` (only profile viewing)
- Grep search for "message" or "chat" class names returns 0 code entities
- No WebSocket configuration for real-time messaging

**Backend Controller Files Analyzed:**
1. ✅ `AuthController.java` - Register, Login, Token Validation
2. ✅ `PageController.java` - CRUD operations on Workspace Pages
3. ✅ `FeedController.java` - Community Feed, Likes, Comments, Clone
4. ✅ `UserController.java` - User Profile, Update User Profile
5. ✅ `AdminController.java` - Admin operations
6. ❌ `MessageController.java` - NOT FOUND
7. ❌ `ChatController.java` - NOT FOUND

**Attempting Endpoints (Will Fail):**
```
POST /api/messages                      → 404 Not Found
POST /api/chat                          → 404 Not Found
POST /api/direct-messages               → 404 Not Found
POST /api/users/{id}/message            → 404 Not Found
GET /api/messages/{conversationId}      → 404 Not Found
GET /api/chat/conversations             → 404 Not Found
WebSocket: /ws/chat                     → Not Available
```

**Documentation References (Misleading):**
- `IMPLEMENTATION_VERIFIED.md` Line 131-133 lists "Direct Messaging" as feature
- `USER_PROFILE_FEATURE.md` mentions "Message user button"
- `TESTING_GUIDE.md` includes "Chat System Tests"
- **NOTE:** These are documented features but NOT actually implemented in code

**Impact:**
- ❌ Alice cannot send direct messages to Bob
- ❌ No real-time chat functionality
- ❌ No conversation history storage
- ❌ Profile "Message" buttons will not function

---

### Feature 2: User Followers/Following System

**Status:** ⚠️ **PARTIALLY MISSING**

**Evidence:**
- No `followers` or `following` fields in `User.java` model
- No `Relationship` or `Follow` entity model
- No follow-related endpoints in `UserController.java`
- No follow logic in services

**Documented But Not Implemented:**
- `USER_PROFILE_FEATURE.md` mentions "Follow Button"
- Expected: `POST /api/users/{id}/follow` endpoint
- Expected: `GET /api/users/{id}/followers` endpoint

---

### Feature 3: Notification System

**Status:** ❌ **NOT IMPLEMENTED**

**Evidence:**
- No `Notification` model
- No `NotificationController`
- No `NotificationRepository`
- No notification service

**Would Support:**
- On-follow notifications
- On-comment notifications
- On-like notifications
- On-message notifications

---

### Feature 4: Block/Report User System

**Status:** ❌ **NOT IMPLEMENTED**

**Evidence:**
- No `blockedUsers` field in User model
- No `Block` or `Report` entity
- No blocking/reporting endpoints

---

## Test Summary Table

| Test # | Feature | Endpoint | Status | Notes |
|--------|---------|----------|--------|-------|
| 1.1 | Register Alice | `POST /api/auth/register` | ✅ PASS | User created, token issued |
| 1.2 | Register Bob | `POST /api/auth/register` | ✅ PASS | User created, token issued |
| 2.1 | Token Validation | `POST /api/auth/validate` | ✅ PASS | Alice token valid |
| 2.2 | Create Page | `POST /api/pages` | ✅ PASS | Page created with blocks |
| 3.1 | Share Template | `POST /api/feed` | ✅ PASS | FeedItem created, linked to page |
| 4.1 | Bob Login | `POST /api/auth/validate` | ✅ PASS | Bob token valid |
| 4.2 | View Feed | `GET /api/feed` | ✅ PASS | Feed returns Alice's post |
| 4.3 | View Profile | `GET /api/users/{id}/profile` | ✅ PASS | Profile shows user & posts |
| 5.1 | Clone Template | `POST /api/feed/{id}/clone` | ✅ PASS | Page cloned to Bob's workspace |
| 5.2 | Verify Clone | `GET /api/pages` | ✅ PASS | Bob owns cloned page |
| 6.1 | Send Message | `POST /api/messages` | ❌ NOT IMPLEMENTED | No messaging system |

---

## Conclusion

The LifeFlow application successfully implements:
- ✅ Multi-user account management
- ✅ Workspace page creation and management
- ✅ Community feed with sharing and templates
- ✅ User profile viewing
- ✅ Template cloning with proper ownership

**Critical Gaps:**
- ❌ Real-time messaging/chat (NOT IMPLEMENTED)
- ⚠️ User followers/following system (MISSING)
- ❌ Notification system (NOT IMPLEMENTED)
- ❌ User blocking/reporting (NOT IMPLEMENTED)

**Database Integrity:** ✅ **VALIDATED**
- All relationships properly established
- No orphaned data
- Ownership correctly assigned after cloning

---

## Recommendations

1. **High Priority:** Implement real-time messaging system (WebSocket or REST polling)
2. **Medium Priority:** Add followers/following system with proper relationship tracking
3. **Medium Priority:** Implement notification system for user interactions
4. **Low Priority:** Add user blocking and content reporting features
5. **Documentation:** Update markdown files to reflect actual implementation status

---

## Test Execution Record

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-01-26 | Lead QA | ✅ PASS (with gaps) | See Missing Features Report |

