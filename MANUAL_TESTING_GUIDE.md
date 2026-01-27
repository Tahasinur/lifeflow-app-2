# Step-by-Step Manual Testing Guide

## Setup

### 1. Ensure Frontend is Running
```bash
cd frontend
npm run dev
# Should see: ➜  Local:   http://localhost:5000/
```

### 2. Ensure Backend is Running (on Port 8080)
```bash
cd backend
# Backend should be running for full API functionality
# Some endpoints may return demo data if backend isn't running
```

### 3. Open Browser
- Navigate to: `http://localhost:5000`
- Open Developer Console: `F12` or `Cmd+Option+I`

---

## Test Sequence

### PART A: Feed Page Setup

**Step 1**: Navigate to Feed Page
- Click "Community Feed" in sidebar (if visible)
- Or go directly to `http://localhost:5000/feed`
- Wait for page to load (you should see "Community Feed" title)

**Step 2**: Observe Feed Content
- Look for feed items (templates or blogs)
- Each item should show:
  - Type badge (blue for template, purple for blog)
  - Title (should look clickable)
  - Description
  - Tags
  - Author info with avatar
  - Like and comment buttons

**Expected**: Feed page shows with multiple items and author names visible

---

### PART B: Test Author Name Navigation

**Step 3**: Hover Over Author Name
- Find a template item in the feed
- Hover over the author name (should be below the template description)
- Observe the styling change

**Expected**: 
- Text turns blue
- Underline appears
- Cursor changes to pointer

**Step 4**: Click Author Name
- Click on the author name
- Watch for navigation
- Check URL bar - should change to `/user/{authorName}`

**Expected**: 
- URL changes to something like `/user/Sarah%20Johnson` or similar
- No errors in console
- Page transitions smoothly

**Step 5**: Verify Profile Page Load
- Wait for page to fully load (should take < 2 seconds)
- You should see:
  - Back arrow button (top-left)
  - Author avatar (blue circle with initials or custom image)
  - Author name
  - Author bio
  - "X Public Templates" count
  - "Message" button

**Expected**: Profile page displays without errors

---

### PART C: Test Profile Features

**Step 6**: Check Templates Grid
- Scroll down on the profile page
- Look for templates displayed in a grid
- Each template card should show:
  - Title
  - Description
  - Tags
  - Date
  - Like count
  - Copy/Use button

**Expected**: 
- Templates display in responsive grid
- No layout issues
- All information visible

**Step 7**: Test Like Button
- Find a template in the grid
- Click the heart icon
- Observe changes

**Expected**:
- Heart fills with red color
- Like count updates (or shows "Liked!" toast)
- Toast notification appears saying "Liked!"

**Step 8**: Click Like Again
- Click the heart icon again to unlike

**Expected**:
- Heart becomes empty/outlined again
- Styling reverts

**Step 9**: Test Copy Button
- Find a template
- Click the copy/use button (should show appropriate icon)
- Check for confirmation

**Expected**:
- Toast notification shows "Template copied to your workspace!"
- No errors in console
- Button remains functional

---

### PART D: Test Navigation

**Step 10**: Test Back Button
- On the profile page, click the back arrow button (top-left)
- Observe navigation

**Expected**:
- Returns to feed page
- URL changes back to `/feed`
- Feed content visible again

**Step 11**: Test Message Button
- Go back to an author profile
- Click "Message" button

**Expected**:
- Navigates to inbox or messaging interface
- User/author is pre-selected
- No errors

---

### PART E: Test Different Author Types

**Step 12**: Test Blog Author Navigation
- Go back to feed
- Find a featured blog post (marked with "Featured" badge)
- Click on the featured blog post's author name

**Expected**:
- Same behavior as template author navigation
- Profile page loads

**Step 13**: Test Regular Blog Author
- Find a regular blog post (in the list)
- Click author name

**Expected**:
- Same behavior as template author
- Profile page loads

---

### PART F: Responsive Design

**Step 14**: Test Mobile View
- Open Dev Tools (F12)
- Click device toggle (or press Cmd+Shift+M)
- Select iPhone 12 or similar mobile device

**Expected**:
- Profile page still works
- Templates stack in single column
- All buttons remain functional and clickable
- No horizontal scroll

**Step 15**: Test Tablet View
- Switch to iPad or similar tablet device
- Verify layout

**Expected**:
- Templates display in 2 columns on tablet
- Readable and usable

**Step 16**: Switch Back to Desktop
- Close device emulation
- Verify desktop layout (3 columns)

**Expected**:
- Templates display in 3-column grid

---

### PART G: Dark Mode

**Step 17**: Toggle Dark Mode
- Look for dark mode toggle (if available in UI)
- Or open browser settings to enable dark mode
- Navigate to author profile

**Expected**:
- All text is readable
- Colors have good contrast
- Styling looks correct
- No visibility issues

---

### PART H: Console & Network Check

**Step 18**: Check Console for Errors
- Keep Dev Tools open
- Navigate through: Feed → Click Author → Profile → Back
- Look at Console tab

**Expected**:
- No red error messages
- No warning messages about failed requests
- Clean console

**Step 19**: Check Network Requests
- Switch to Network tab in Dev Tools
- Reload page
- Perform author click

**Expected**:
- API requests show in network tab
- Requests complete successfully
- No 404 or 500 errors
- No CORS errors

---

## Issues to Look For

### Critical Issues
- ❌ Navigation doesn't work
- ❌ Profile page doesn't load
- ❌ Console errors
- ❌ 404/500 API errors
- ❌ Broken styling

### Minor Issues
- ⚠️ Slow load times (>2 seconds)
- ⚠️ Layout issues on mobile
- ⚠️ Hover effects not working
- ⚠️ Toast notifications not showing

---

## Quick Test (5 minutes)

If short on time, do this:

1. Navigate to `/feed`
2. Click an author name → Should navigate to `/user/{name}`
3. Verify profile page loads with user info and templates
4. Click back arrow → Should return to `/feed`
5. Check console for errors → Should be clean

---

## Full Test (15 minutes)

Complete all steps from PART A through PART H.

---

## Reporting Issues

If you find issues, please include:

1. **Issue Description**: What didn't work?
2. **Steps to Reproduce**: How to make it happen again?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happens?
5. **Screenshot**: If possible
6. **Console Error**: Exact error message (if any)
7. **URL**: What page were you on?
8. **Device**: Desktop/Mobile/Tablet?
9. **Browser**: Chrome/Firefox/Safari/Edge?

---

## Success Criteria

✅ All tests pass if:
- Author names are clickable
- Navigation to profile works
- Profile page displays correctly
- Templates display in grid
- Like/copy buttons work
- Back navigation works
- Console has no errors
- Mobile view is responsive
- Dark mode looks good

**Status**: Ready to test!
