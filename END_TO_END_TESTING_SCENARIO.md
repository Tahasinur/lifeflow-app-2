# End-to-End Testing Scenario

## Test Environment Setup

**Prerequisites**:
- Frontend running on http://localhost:5000
- Backend running on http://localhost:8080
- Browser with developer tools
- About 10-15 minutes

---

## Scenario 1: Complete User Journey

### Scenario: "Sarah discovers a blog and visits the author's profile"

#### Step 1: User Opens App
```
Action: Navigate to http://localhost:5000/feed
Expected: 
  - Community Feed page loads
  - Multiple feed items visible
  - Author information displays on each item
Result: ✓ Pass / ✗ Fail
```

#### Step 2: User Notices Interesting Blog
```
Action: Scan feed for blog posts
         Look for purple "Blog" badges
Expected:
  - Blog posts visible in feed
  - Each blog shows:
    * Featured or regular blog badge
    * Title
    * Description snippet
    * Author name (in blue)
    * Like and comment counts
Result: ✓ Pass / ✗ Fail
```

#### Step 3: User Reads Blog Preview
```
Action: Read blog description
Expected:
  - Description clearly visible
  - Tags relevant to topic
  - Author clearly identified
Result: ✓ Pass / ✗ Fail
```

#### Step 4: User Wants to Learn About Author
```
Action: Hover over author name
Expected:
  - Cursor changes to pointer
  - Author name turns blue
  - Underline appears
  - Visual indication it's clickable
Result: ✓ Pass / ✗ Fail
```

#### Step 5: User Clicks Author Name
```
Action: Click on author name
Expected:
  - URL changes to /user/{authorName}
  - Page transitions smoothly
  - No errors in console
Result: ✓ Pass / ✗ Fail
```

#### Step 6: Author Profile Loads
```
Action: Wait for page load
Expected:
  - Profile page displays
  - Shows:
    * Back arrow button (top-left)
    * Author avatar
    * Author name prominently displayed
    * Author bio
    * "X Public Templates" count
    * Message button
Result: ✓ Pass / ✗ Fail
```

#### Step 7: User Explores Author's Templates
```
Action: Scroll down to see templates
Expected:
  - Templates display in grid
  - Multiple template cards visible
  - Each card shows:
    * Template title (clickable)
    * Description
    * Tags
    * Creation date
    * Like count
    * Copy button
Result: ✓ Pass / ✗ Fail
```

#### Step 8: User Likes a Template
```
Action: Click heart icon on a template
Expected:
  - Heart fills with red color
  - Toast notification: "Liked!"
  - Like count updates
  - No console errors
Result: ✓ Pass / ✗ Fail
```

#### Step 9: User Copies a Template
```
Action: Click copy button on a template
Expected:
  - Toast notification: "Template copied to your workspace!"
  - No errors
  - Button remains clickable
  - Can test multiple times
Result: ✓ Pass / ✗ Fail
```

#### Step 10: User Messages Author
```
Action: Click "Message" button
Expected:
  - Navigates to messaging/inbox
  - Author pre-selected
  - Can compose message
  - No errors
Result: ✓ Pass / ✗ Fail
```

#### Step 11: User Returns to Feed
```
Action: Click back arrow button
Expected:
  - URL changes back to /feed
  - Feed page displays
  - Previous scroll position restored (if browser cached)
  - No errors
Result: ✓ Pass / ✗ Fail
```

---

## Scenario 2: Multi-Author Navigation

### Scenario: "User explores multiple authors in rapid succession"

#### Flow
```
Feed Page
  ↓
Click Author 1 → Profile displays
  ↓
Back → Feed Page
  ↓
Click Author 2 → Profile displays
  ↓
Back → Feed Page
  ↓
Click Author 3 → Profile displays
```

#### Expected Results
```
✓ All 3 navigation transitions are smooth
✓ Each profile loads without errors
✓ No cached data mix-ups
✓ Back button always works
✓ Console remains clean
```

---

## Scenario 3: Blog vs Template Author Navigation

### Scenario: "User tests clicking authors from different content types"

#### Step 1: Click Template Author
```
Feed → Find Template → Click Author Name
Expected: ✓ Profile loads with templates
Result: ___________
```

#### Step 2: Click Featured Blog Author
```
Feed → Find Featured Blog → Click Author Name
Expected: ✓ Profile loads with templates
Result: ___________
```

#### Step 3: Click Regular Blog Author
```
Feed → Scroll to Blog List → Find Regular Blog → Click Author Name
Expected: ✓ Profile loads with templates
Result: ___________
```

#### All Tests Pass
```
Expected: ✓ All three types of author clicks work identically
Result: ___________
```

---

## Scenario 4: Responsive Design

### Desktop Testing
```
Device: 1920x1080 (or larger)
Test:
  - Navigate to author profile
  - Verify 3-column template grid
  - Check all buttons clickable
  - Verify spacing adequate
Result: ✓ Pass / ✗ Fail
```

### Tablet Testing
```
Device: 768x1024 (iPad size)
Test:
  - Navigate to author profile
  - Verify 2-column template grid
  - Check buttons remain clickable
  - Verify readable on smaller screen
Result: ✓ Pass / ✗ Fail
```

### Mobile Testing
```
Device: 375x667 (iPhone size)
Test:
  - Navigate to author profile
  - Verify 1-column template grid
  - Check back button accessible
  - Check message button accessible
  - No horizontal scrolling
  - Templates fully visible
Result: ✓ Pass / ✗ Fail
```

---

## Scenario 5: Error Handling

### Test Invalid User
```
Action: Navigate to /user/nonexistent-user
Expected:
  - Error toast shows: "User not found"
  - Redirect back or to safe page
  - No crash
  - Console error explained
Result: ✓ Pass / ✗ Fail
```

### Test Network Error
```
Action: Disconnect network → Navigate to profile → Reconnect
Expected:
  - Error message displayed
  - User can retry
  - No crash
  - Console logs error
Result: ✓ Pass / ✗ Fail
```

### Test Slow Network
```
Action: Use DevTools → Throttle to Slow 3G
        Navigate to profile
Expected:
  - Shows loading state
  - Doesn't timeout
  - Eventually loads
  - User sees "Loading profile..."
Result: ✓ Pass / ✗ Fail
```

---

## Scenario 6: Dark Mode

### Test Dark Mode
```
Action: Enable dark mode (browser setting or app toggle)
        Navigate to author profile
Expected:
  - Background is dark
  - Text is readable
  - All colors have good contrast
  - Hover effects still work
  - Buttons clearly visible
Result: ✓ Pass / ✗ Fail
```

### Test Mode Switching
```
Action: Toggle between light/dark mode
        While on profile page
Expected:
  - Theme switches smoothly
  - All content remains visible
  - No styling issues
  - No need to reload
Result: ✓ Pass / ✗ Fail
```

---

## Scenario 7: Interaction Flows

### Like Multiple Templates
```
Action: On profile page, like 3 different templates
Expected:
  - Each like works independently
  - Hearts fill and empty correctly
  - Toast shows for each action
  - Like counts update
  - Can unlike and like again
Result: ✓ Pass / ✗ Fail
```

### Copy Multiple Templates
```
Action: On profile page, copy 3 different templates
Expected:
  - Each copy works independently
  - Success toast for each
  - API called for each
  - Can copy same template multiple times
Result: ✓ Pass / ✗ Fail
```

### Rapid Clicking
```
Action: Rapidly click like button 5 times
Expected:
  - No duplicate API calls
  - UI state updates correctly
  - No freezing or lag
  - Toast shows accurately
Result: ✓ Pass / ✗ Fail
```

---

## Scenario 8: Browser Console Verification

### Open Console
```
Action: Press F12 to open developer tools
        Switch to Console tab
```

### Test Navigation
```
Action: Perform full flow:
  1. Feed page
  2. Click author
  3. Profile page
  4. Back to feed
Expected:
  - No red error messages
  - No CORS errors
  - No undefined warnings
  - No 404 errors
  - Clean console output
Result: ✓ Pass / ✗ Fail
```

### Check Network Tab
```
Action: Switch to Network tab
        Reload profile page
Expected:
  - API calls complete with 200 status
  - No failed requests (404, 500)
  - Load times reasonable (<1s)
  - No duplicate requests
Result: ✓ Pass / ✗ Fail
```

---

## Summary Scorecard

| Feature | Status | Notes |
|---------|--------|-------|
| Feed Page Loads | ✓ ✗ | ___________ |
| Author Names Clickable | ✓ ✗ | ___________ |
| Navigation Works | ✓ ✗ | ___________ |
| Profile Displays | ✓ ✗ | ___________ |
| Templates Grid | ✓ ✗ | ___________ |
| Like Button | ✓ ✗ | ___________ |
| Copy Button | ✓ ✗ | ___________ |
| Back Button | ✓ ✗ | ___________ |
| Message Button | ✓ ✗ | ___________ |
| Template Author Nav | ✓ ✗ | ___________ |
| Blog Author Nav | ✓ ✗ | ___________ |
| Mobile Layout | ✓ ✗ | ___________ |
| Tablet Layout | ✓ ✗ | ___________ |
| Dark Mode | ✓ ✗ | ___________ |
| Console Clean | ✓ ✗ | ___________ |
| Network OK | ✓ ✗ | ___________ |

---

## Overall Result

**Total Tests**: 15
**Passed**: ___
**Failed**: ___

### Status
- [ ] All tests passed - READY FOR PRODUCTION
- [ ] Some tests failed - NEEDS FIXES
- [ ] Many tests failed - NEEDS REVIEW

---

## Issues Found

### Critical (Blocks Release)
1. ___________
2. ___________

### Major (Should Fix)
1. ___________
2. ___________

### Minor (Can Fix Later)
1. ___________
2. ___________

---

## Notes
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Tested By**: ________________  
**Date**: ________________  
**Sign-Off**: ________________
