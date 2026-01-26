# LifeFlow E2E Testing Quick Reference Guide

**Last Updated:** January 26, 2026  
**QA Lead:** Lead QA Engineer

---

## Quick Start (5 Minutes)

### Prerequisites Checklist
- [ ] PostgreSQL running on `localhost:5432` with database `lifeflow`
- [ ] Spring Boot backend running on `http://localhost:8080`
- [ ] PowerShell or terminal access
- [ ] Optional: pgAdmin or psql for database queries

### Step 1: Run Automated Test Suite
```powershell
# Navigate to project root
cd c:\Users\tahas\OneDrive\Documents\GitHub\lifeflow-app-2

# Run the automated test script
.\E2E_TEST_RUNNER.ps1
```

**Expected Output:**
```
================================================================================
LIFEFLOW E2E AUTOMATED TEST SUITE
================================================================================
Start Time: 2026-01-26 10:15:30
Base URL: http://localhost:8080
Log File: E2E_TEST_RESULTS.log

...
[TEST RESULTS]
Total Tests: 11
Passed: 10
Failed: 1 (Messaging - expected, not implemented)
Pass Rate: 90.91%
```

### Step 2: Run Database Validation Queries
Open pgAdmin or psql and run queries from `DATABASE_VALIDATION_QUERIES.sql`:

```sql
-- Quick check: Verify users exist
SELECT id, name, email FROM users WHERE email IN ('alice@test.com', 'bob@test.com');

-- Quick check: Verify cloning worked
SELECT id, title, user_id FROM pages WHERE title LIKE '%Cloned%';

-- Quick check: Verify feed item
SELECT id, title, type FROM feed_items WHERE type = 'template' LIMIT 1;
```

### Step 3: Review Results
- Check `E2E_TEST_RESULTS.log` for detailed test output
- Consult `E2E_TEST_SCRIPT.md` for expected vs. actual results
- Review `QA_MISSING_FEATURES_REPORT.md` for implementation gaps

---

## Manual Testing (Step-by-Step)

If you prefer to manually test or need to debug specific scenarios:

### Phase 1: Account Creation

**Register Alice:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@test.com",
    "password": "Alice123!@#"
  }'
```

**Expected Response:**
```json
{
  "userId": "<uuid>",
  "email": "alice@test.com",
  "name": "Alice Johnson",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "User registered successfully"
}
```

**Save:** Store `userId` as `ALICE_ID` and `token` as `ALICE_TOKEN`

---

**Register Bob:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@test.com",
    "password": "Bob123!@#"
  }'
```

**Save:** Store `userId` as `BOB_ID` and `token` as `BOB_TOKEN`

---

### Phase 2: Alice Creates & Shares Content

**Create Page (as Alice):**
```bash
curl -X POST http://localhost:8080/api/pages \
  -H "X-User-Id: {ALICE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "page-alice-study-guide",
    "title": "Alice'"'"'s Study Guide",
    "icon": "📚",
    "userId": "{ALICE_ID}",
    "blocksJson": "[{\"type\":\"heading\",\"content\":\"Chapter 1: Introduction\"},{\"type\":\"paragraph\",\"content\":\"This is a study guide for advanced Python.\"}]",
    "editorContentJson": "{}",
    "favorite": false,
    "deleted": false
  }'
```

**Create & Share Template:**
```bash
curl -X POST http://localhost:8080/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alice'"'"'s Study Guide - Template",
    "description": "A comprehensive study guide for Python beginners.",
    "type": "template",
    "sourcePageId": "page-alice-study-guide",
    "userId": "{ALICE_ID}",
    "tags": ["python", "study-guide", "template"]
  }'
```

**Save:** Store `id` as `FEED_ITEM_ID`

---

### Phase 3: Bob Interacts

**View Feed (as Bob):**
```bash
curl -X GET http://localhost:8080/api/feed \
  -H "Accept: application/json"
```

**Expected:** Array with Alice's template visible

---

**View Alice's Profile (as Bob):**
```bash
curl -X GET http://localhost:8080/api/users/{ALICE_ID}/profile \
  -H "Accept: application/json"
```

**Expected:** User profile with posts array containing the template

---

### Phase 4: Clone Template (as Bob)

```bash
curl -X POST http://localhost:8080/api/feed/{FEED_ITEM_ID}/clone \
  -H "X-User-Id: {BOB_ID}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "{BOB_ID}"}'
```

**Expected Response:**
```json
{
  "success": true,
  "pageId": "<newPageUuid>",
  "message": "Template cloned successfully!"
}
```

**Save:** Store `pageId` as `BOB_CLONED_PAGE_ID`

---

**Verify Clone in Bob's Workspace:**
```bash
curl -X GET http://localhost:8080/api/pages \
  -H "X-User-Id: {BOB_ID}" \
  -H "Accept: application/json"
```

**Expected:** Array contains page with:
- `id` = BOB_CLONED_PAGE_ID
- `userId` = BOB_ID (not ALICE_ID!)
- `title` contains "(Cloned)"

---

### Phase 5: Messaging Check (Will Fail)

```bash
# These endpoints DO NOT EXIST
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{"recipientId": "{BOB_ID}", "text": "Hello Bob!"}'

# Expected: 404 Not Found
```

**Result:** ❌ NOT IMPLEMENTED

---

## Database Validation Checklist

Use these queries in pgAdmin/psql to verify data integrity:

### Query Checklist

| Query | File | Purpose |
|-------|------|---------|
| Query 1 | DATABASE_VALIDATION_QUERIES.sql | ✅ Both users exist |
| Query 2 | DATABASE_VALIDATION_QUERIES.sql | ✅ Alice's page created |
| Query 3 | DATABASE_VALIDATION_QUERIES.sql | ✅ Feed item linked to Alice |
| Query 4 | DATABASE_VALIDATION_QUERIES.sql | ✅ Bob owns cloned page |
| Query 5 | DATABASE_VALIDATION_QUERIES.sql | ✅ No orphaned data |
| Query 6 | DATABASE_VALIDATION_QUERIES.sql | ✅ Feed/Page linkage valid |
| Query 7 | DATABASE_VALIDATION_QUERIES.sql | ✅ Content properly cloned |
| Query 8 | DATABASE_VALIDATION_QUERIES.sql | ✅ Comment counts correct |
| Query 9 | DATABASE_VALIDATION_QUERIES.sql | ✅ User activity summary |
| Query 10 | DATABASE_VALIDATION_QUERIES.sql | ❌ Messaging tables absent |

---

## Test Results Interpretation

### ✅ PASS Results

```
✅ PASS: Alice registered successfully
✅ PASS: Bob registered successfully
✅ PASS: Alice token validated
✅ PASS: Page created: Alice's Study Guide
✅ PASS: Template created: Alice's Study Guide - Template
✅ PASS: Bob token validated
✅ PASS: Community feed fetched, found Alice's post
✅ PASS: Alice's profile loaded: Alice Johnson
✅ PASS: Template cloned successfully
✅ PASS: Cloned page found in Bob's workspace with correct ownership
```

### ⚠️ EXPECTED FAILURE

```
⚠️ WARN: NO MESSAGING ENDPOINTS FOUND - Messaging system NOT IMPLEMENTED
```

This is **EXPECTED** - Real-time messaging is not yet implemented in the backend.

---

## Common Issues & Troubleshooting

### Issue: "Connection refused" Error

**Cause:** Backend not running  
**Fix:**
```bash
cd backend
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

**Expected:** Backend starts on port 8080

---

### Issue: "Connection refused" on Database

**Cause:** PostgreSQL not running  
**Fix:** Start PostgreSQL service
```powershell
# Windows
net start postgresql-x64-<version>

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

---

### Issue: Token Validation Returns 401

**Cause:** Token expired or invalid  
**Fix:** Re-register users and capture fresh token

---

### Issue: Clone Returns "No source page linked"

**Cause:** FeedItem doesn't have sourcePageId  
**Fix:** Ensure you're cloning a template with valid sourcePageId

---

### Issue: Cloned Page Shows Wrong Owner

**Cause:** Clone endpoint not setting userId correctly  
**Fix:** Check FeedController line 152 - should set new page's userId to cloning user

---

## Test Report Files

| File | Purpose | Location |
|------|---------|----------|
| `E2E_TEST_SCRIPT.md` | Detailed test plan with all scenarios | Root directory |
| `E2E_TEST_RUNNER.ps1` | Automated PowerShell test script | Root directory |
| `E2E_TEST_RESULTS.log` | Generated test execution log | Root directory |
| `DATABASE_VALIDATION_QUERIES.sql` | SQL queries for data validation | Root directory |
| `QA_MISSING_FEATURES_REPORT.md` | Analysis of not-implemented features | Root directory |

---

## Feature Status Summary

### ✅ Implemented & Tested
- Account Registration & Login
- User Profile Viewing
- Workspace Page Creation
- Community Feed Sharing
- Template Cloning
- Page Comments

### ❌ Not Implemented
- Real-Time Messaging/Chat
- Direct Messages
- Follow System
- Notifications
- User Search
- Block/Report Users

### ⚠️ Partially Implemented
- User Management (no followers/following)
- Admin Features (basic admin controller exists)

---

## Performance Notes

### Test Execution Time
- Full automated suite: ~5-10 seconds
- Manual testing: 10-15 minutes

### Database Size After Tests
- New users: 2 rows
- New pages: 1-2 rows
- New feed items: 1 row
- Comments: 0-X rows (depends on test variations)

### Cleanup (Optional)
To clean up test data:
```sql
-- Delete test users and cascade (be careful!)
DELETE FROM users WHERE email IN ('alice@test.com', 'bob@test.com');
```

---

## Next Steps for QA

1. ✅ Run automated test suite - **DONE**
2. ✅ Validate database integrity - **DONE**
3. ✅ Document missing features - **DONE**
4. ⏳ **Manual exploratory testing** (UI interactions)
5. ⏳ **Performance testing** (load/stress)
6. ⏳ **Security testing** (auth, XSS, SQL injection)
7. ⏳ **Regression testing** (after each backend update)

---

## Documentation Index

- **E2E Test Script:** `E2E_TEST_SCRIPT.md` - Complete test scenarios with curl examples
- **Automated Testing:** `E2E_TEST_RUNNER.ps1` - PowerShell automation script
- **Database Queries:** `DATABASE_VALIDATION_QUERIES.sql` - SQL validation queries
- **Missing Features:** `QA_MISSING_FEATURES_REPORT.md` - Detailed gap analysis
- **This Guide:** `E2E_TESTING_QUICK_REFERENCE.md` - Quick start and troubleshooting

---

## Contact & Support

For issues or questions regarding these tests:

1. Review the relevant markdown file above
2. Check troubleshooting section
3. Run individual test scenarios manually using curl
4. Consult QA_MISSING_FEATURES_REPORT.md for feature status

---

**Test Suite Version:** 1.0  
**Last Updated:** 2026-01-26  
**Status:** ✅ Ready for Execution
