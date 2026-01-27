// Test Script for Author Profile Functionality
// Run this in browser console at http://localhost:5000

// Test 1: Navigate to feed and check if feed loads
async function testFeedLoads() {
  console.log('TEST 1: Checking if feed loads...');
  try {
    const response = await fetch('/api/feed');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Feed loaded successfully');
      console.log('Feed items:', data.length);
      return data;
    } else {
      console.error('❌ Feed API returned:', response.status);
      return null;
    }
  } catch (err) {
    console.error('❌ Error loading feed:', err);
    return null;
  }
}

// Test 2: Check if author data exists in feed items
async function testAuthorDataInFeed() {
  console.log('\nTEST 2: Checking author data in feed items...');
  const feedData = await testFeedLoads();
  if (!feedData || feedData.length === 0) {
    console.error('❌ No feed data available');
    return;
  }

  const firstItem = feedData[0];
  console.log('First feed item:', firstItem);
  
  if (firstItem.author) {
    console.log('✅ Author data exists:', {
      name: firstItem.author.name,
      id: firstItem.author.id,
      email: firstItem.author.email
    });
  } else {
    console.error('❌ No author data in feed item');
  }
}

// Test 3: Fetch user profile directly
async function testUserProfileAPI(userId) {
  console.log(`\nTEST 3: Fetching user profile for ${userId}...`);
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ User profile fetched:', {
        name: userData.name,
        bio: userData.bio,
        avatar: userData.avatar
      });
      return userData;
    } else {
      console.error('❌ User API returned:', response.status);
      return null;
    }
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    return null;
  }
}

// Test 4: Fetch user templates
async function testUserTemplates(userId) {
  console.log(`\nTEST 4: Fetching templates for user ${userId}...`);
  try {
    const response = await fetch(`/api/feed?authorId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      const templates = data.filter(item => item.type === 'template');
      console.log('✅ Templates fetched:', templates.length);
      templates.slice(0, 2).forEach((t, i) => {
        console.log(`  Template ${i + 1}: ${t.title}`);
      });
      return templates;
    } else {
      console.error('❌ Templates API returned:', response.status);
      return null;
    }
  } catch (err) {
    console.error('❌ Error fetching templates:', err);
    return null;
  }
}

// Test 5: Test UI element presence
async function testUIElements() {
  console.log('\nTEST 5: Checking UI elements...');
  
  // Check if FeedPage title clickable
  const feedPage = document.querySelector('h1');
  if (feedPage && feedPage.textContent.includes('Community Feed')) {
    console.log('✅ Community Feed page found');
  } else {
    console.log('⚠️  Feed page not visible');
  }

  // Check for buttons
  const buttons = document.querySelectorAll('button');
  console.log(`Found ${buttons.length} buttons on page`);
  
  // Look for author names (should be buttons)
  const authorButtons = Array.from(buttons).filter(btn => 
    btn.textContent.includes('Sarah') || 
    btn.textContent.includes('Michael') ||
    btn.textContent.includes('Emma') ||
    btn.textContent.includes('David')
  );
  
  if (authorButtons.length > 0) {
    console.log(`✅ Found ${authorButtons.length} clickable author names`);
  } else {
    console.log('⚠️  No clickable author names found');
  }
}

// Test 6: Test navigation by simulating click
function testAuthorNavigation() {
  console.log('\nTEST 6: Testing author name click functionality...');
  
  const buttons = document.querySelectorAll('button');
  const authorButton = Array.from(buttons).find(btn => 
    btn.textContent.includes('Sarah Johnson') ||
    btn.textContent.includes('Michael Chen') ||
    btn.textContent.includes('Emma Wilson')
  );
  
  if (authorButton) {
    console.log('✅ Found author button:', authorButton.textContent);
    console.log('   Recommended action: Click this button to test navigation');
    return authorButton;
  } else {
    console.log('⚠️  Could not find author button');
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(50));
  console.log('AUTHOR PROFILE FUNCTIONALITY TEST SUITE');
  console.log('='.repeat(50));
  
  await testFeedLoads();
  await testAuthorDataInFeed();
  
  // Get first user ID from feed
  const feedData = await testFeedLoads();
  if (feedData && feedData.length > 0 && feedData[0].author?.id) {
    const userId = feedData[0].author.id;
    await testUserProfileAPI(userId);
    await testUserTemplates(userId);
  }
  
  testUIElements();
  testAuthorNavigation();
  
  console.log('\n' + '='.repeat(50));
  console.log('MANUAL TESTS TO PERFORM:');
  console.log('='.repeat(50));
  console.log('1. Click on any author name in the feed');
  console.log('2. Verify navigation to /user/{authorName}');
  console.log('3. Check if user profile page loads');
  console.log('4. Verify templates display on profile');
  console.log('5. Test like button functionality');
  console.log('6. Test follow button functionality');
  console.log('7. Test message button functionality');
}

// Execute tests
runAllTests();
