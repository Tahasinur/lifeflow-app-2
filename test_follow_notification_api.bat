@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo Follow System and Notification API Tests
echo ========================================
echo.
echo Starting tests on http://localhost:8090
echo.

REM Test 1: Get unread notification count
echo [TEST 1] Get Unread Notification Count
curl -s http://localhost:8090/api/notifications/test-user-123/unread-count
echo.
echo.

REM Test 2: Check follow status
echo [TEST 2] Check Follow Status (user1 following user2)
curl -s http://localhost:8090/api/follows/user1/is-following/user2
echo.
echo.

REM Test 3: Get follower count
echo [TEST 3] Get Follower Count for user1
curl -s http://localhost:8090/api/follows/user1/follower-count
echo.
echo.

REM Test 4: Get following count
echo [TEST 4] Get Following Count for user1
curl -s http://localhost:8090/api/follows/user1/following-count
echo.
echo.

REM Test 5: Get notification summary
echo [TEST 5] Get Notification Summary
curl -s http://localhost:8090/api/notifications/test-user-123/summary
echo.
echo.

echo ========================================
echo Tests completed!
echo ========================================
