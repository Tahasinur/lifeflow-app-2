# LifeFlow E2E Automated Test Script
# Runs all test scenarios and validates responses
# Prerequisites: Backend running on http://localhost:8080, PostgreSQL on localhost:5432
# Usage: .\E2E_TEST_RUNNER.ps1

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$LogFile = "E2E_TEST_RESULTS.log",
    [switch]$Verbose = $false
)

# Color output helper
function Write-TestHeader {
    param([string]$Text)
    Write-Host "`n$('='*80)" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "$(('='*80))" -ForegroundColor Cyan
}

function Write-Pass {
    param([string]$Text)
    Write-Host "✅ PASS: $Text" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Text)
    Write-Host "❌ FAIL: $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  INFO: $Text" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  WARN: $Text" -ForegroundColor Yellow
}

# Test logging
function Log-Test {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details,
        [string]$Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    )
    
    $logEntry = "[$Timestamp] $Status | $TestName | $Details"
    Add-Content -Path $LogFile -Value $logEntry
    Write-Verbose $logEntry
}

# API Call wrapper with error handling
function Invoke-TestApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$TestName = ""
    )
    
    $url = "$BaseUrl$Endpoint"
    $params = @{
        Uri = $url
        Method = $Method
        Headers = $Headers
        ErrorAction = "SilentlyContinue"
        WarningAction = "SilentlyContinue"
    }
    
    if ($Body) {
        $params.Body = $Body | ConvertTo-Json -Depth 10
        $params.ContentType = "application/json"
    }
    
    Write-Info "Testing: $Method $Endpoint"
    
    try {
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            Success = $true
            Response = $response
        }
    }
    catch {
        if ($_.Exception.Response) {
            return @{
                StatusCode = $_.Exception.Response.StatusCode.Value__
                Content = $null
                Success = $false
                ErrorMessage = $_.Exception.Message
                Response = $_
            }
        }
        else {
            return @{
                StatusCode = 0
                Content = $null
                Success = $false
                ErrorMessage = "Connection failed: $($_.Exception.Message)"
                Response = $null
            }
        }
    }
}

# Initialize test results
$testResults = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    Tests = @()
}

# Clear previous log
if (Test-Path $LogFile) {
    Remove-Item $LogFile -Force
}

Write-TestHeader "LIFEFLOW E2E AUTOMATED TEST SUITE"
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Log File: $LogFile" -ForegroundColor Cyan

# ==============================================================================
# PHASE 1: ACCOUNT CREATION
# ==============================================================================

Write-TestHeader "PHASE 1: ACCOUNT CREATION"

# Test 1.1: Register Alice
Write-Host "`n[TEST 1.1] Register Alice" -ForegroundColor Yellow

$aliceBody = @{
    name = "Alice Johnson"
    email = "alice@test.com"
    password = "Alice123!@#"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/auth/register" -Body $aliceBody -TestName "Register Alice"

if ($result.Success -and $result.StatusCode -eq 201) {
    Write-Pass "Alice registered successfully"
    $ALICE_ID = $result.Content.userId
    $ALICE_TOKEN = $result.Content.token
    Log-Test "Register Alice" "PASS" "UserId: $ALICE_ID"
    $testResults.PassedTests++
} else {
    Write-Fail "Alice registration failed (Status: $($result.StatusCode))"
    Log-Test "Register Alice" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# Test 1.2: Register Bob
Write-Host "`n[TEST 1.2] Register Bob" -ForegroundColor Yellow

$bobBody = @{
    name = "Bob Smith"
    email = "bob@test.com"
    password = "Bob123!@#"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/auth/register" -Body $bobBody -TestName "Register Bob"

if ($result.Success -and $result.StatusCode -eq 201) {
    Write-Pass "Bob registered successfully"
    $BOB_ID = $result.Content.userId
    $BOB_TOKEN = $result.Content.token
    Log-Test "Register Bob" "PASS" "UserId: $BOB_ID"
    $testResults.PassedTests++
} else {
    Write-Fail "Bob registration failed (Status: $($result.StatusCode))"
    Log-Test "Register Bob" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# ==============================================================================
# PHASE 2: CONTENT CREATION (ALICE)
# ==============================================================================

Write-TestHeader "PHASE 2: CONTENT CREATION (ALICE)"

# Test 2.1: Alice Token Validation
Write-Host "`n[TEST 2.1] Validate Alice Token" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $ALICE_TOKEN"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/auth/validate" -Headers $headers -TestName "Validate Alice Token"

if ($result.Success -and $result.StatusCode -eq 200 -and $result.Content.userId -eq $ALICE_ID) {
    Write-Pass "Alice token validated"
    Log-Test "Validate Alice Token" "PASS" "Token valid"
    $testResults.PassedTests++
} else {
    Write-Fail "Alice token validation failed"
    Log-Test "Validate Alice Token" "FAIL" "Token invalid or user mismatch"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# Test 2.2: Alice Creates a Workspace Page
Write-Host "`n[TEST 2.2] Create Workspace Page" -ForegroundColor Yellow

$pageBody = @{
    id = "page-alice-study-guide"
    title = "Alice's Study Guide"
    icon = "📚"
    userId = $ALICE_ID
    coverImage = ""
    blocksJson = '[{"type":"heading","content":"Chapter 1: Introduction"},{"type":"paragraph","content":"This is a study guide for advanced Python."}]'
    editorContentJson = '{"version":1,"blocks":[]}'
    parentId = $null
    favorite = $false
    deleted = $false
}

$headers = @{
    "X-User-Id" = $ALICE_ID
    "Content-Type" = "application/json"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/pages" -Headers $headers -Body $pageBody -TestName "Create Page"

if ($result.Success -and $result.StatusCode -eq 200 -and $result.Content.id -eq "page-alice-study-guide") {
    Write-Pass "Page created: $($result.Content.title)"
    $ALICE_PAGE_ID = $result.Content.id
    Log-Test "Create Page" "PASS" "PageId: $ALICE_PAGE_ID"
    $testResults.PassedTests++
} else {
    Write-Fail "Page creation failed (Status: $($result.StatusCode))"
    Log-Test "Create Page" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# ==============================================================================
# PHASE 3: SHARING TO COMMUNITY FEED (ALICE)
# ==============================================================================

Write-TestHeader "PHASE 3: SHARING TO COMMUNITY FEED (ALICE)"

# Test 3.1: Alice Creates a Template FeedItem
Write-Host "`n[TEST 3.1] Create Template FeedItem" -ForegroundColor Yellow

$feedBody = @{
    title = "Alice's Study Guide - Template"
    description = "A comprehensive study guide for Python beginners. Includes chapters on fundamentals, OOP, and best practices."
    type = "template"
    sourcePageId = $ALICE_PAGE_ID
    userId = $ALICE_ID
    tags = @("python", "study-guide", "template", "education")
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/feed" -Body $feedBody -TestName "Create Template"

if ($result.Success -and $result.StatusCode -eq 200 -and $result.Content.type -eq "template") {
    Write-Pass "Template created: $($result.Content.title)"
    $FEED_ITEM_ID = $result.Content.id
    Log-Test "Create Template" "PASS" "FeedItemId: $FEED_ITEM_ID"
    $testResults.PassedTests++
} else {
    Write-Fail "Template creation failed (Status: $($result.StatusCode))"
    Log-Test "Create Template" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# ==============================================================================
# PHASE 4: BOB INTERACTIONS
# ==============================================================================

Write-TestHeader "PHASE 4: BOB INTERACTIONS"

# Test 4.1: Bob Token Validation
Write-Host "`n[TEST 4.1] Validate Bob Token" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $BOB_TOKEN"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/auth/validate" -Headers $headers -TestName "Validate Bob Token"

if ($result.Success -and $result.StatusCode -eq 200 -and $result.Content.userId -eq $BOB_ID) {
    Write-Pass "Bob token validated"
    Log-Test "Validate Bob Token" "PASS" "Token valid"
    $testResults.PassedTests++
} else {
    Write-Fail "Bob token validation failed"
    Log-Test "Validate Bob Token" "FAIL" "Token invalid or user mismatch"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# Test 4.2: Bob Fetches Community Feed
Write-Host "`n[TEST 4.2] Fetch Community Feed" -ForegroundColor Yellow

$result = Invoke-TestApi -Method GET -Endpoint "/api/feed" -TestName "Fetch Feed"

if ($result.Success -and $result.StatusCode -eq 200) {
    $feedItems = $result.Content
    if ($feedItems -is [array]) {
        $alicePost = $feedItems | Where-Object { $_.id -eq $FEED_ITEM_ID }
        if ($alicePost) {
            Write-Pass "Community feed fetched, found Alice's post"
            Log-Test "Fetch Feed" "PASS" "Alice's post visible in feed"
            $testResults.PassedTests++
        } else {
            Write-Warning "Feed returned but Alice's post not found"
            Log-Test "Fetch Feed" "WARN" "Alice's post not in feed response"
        }
    } else {
        Write-Fail "Feed response format invalid"
        Log-Test "Fetch Feed" "FAIL" "Response is not array"
        $testResults.FailedTests++
    }
} else {
    Write-Fail "Feed fetch failed (Status: $($result.StatusCode))"
    Log-Test "Fetch Feed" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# Test 4.3: Bob Views Alice's Public Profile
Write-Host "`n[TEST 4.3] View Alice Profile" -ForegroundColor Yellow

$result = Invoke-TestApi -Method GET -Endpoint "/api/users/$ALICE_ID/profile" -TestName "View Profile"

if ($result.Success -and $result.StatusCode -eq 200) {
    $user = $result.Content.user
    $posts = $result.Content.posts
    
    if ($user.id -eq $ALICE_ID -and $user.name -eq "Alice Johnson") {
        Write-Pass "Alice's profile loaded: $($user.name)"
        
        if ($posts -and $posts.Count -gt 0) {
            Write-Pass "Found $($posts.Count) posts on Alice's profile"
            Log-Test "View Profile" "PASS" "Profile with posts loaded"
            $testResults.PassedTests++
        } else {
            Write-Warning "Profile loaded but no posts found"
            Log-Test "View Profile" "WARN" "Profile has no posts"
        }
    } else {
        Write-Fail "Profile data mismatch"
        Log-Test "View Profile" "FAIL" "User data doesn't match"
        $testResults.FailedTests++
    }
} else {
    Write-Fail "Profile fetch failed (Status: $($result.StatusCode))"
    Log-Test "View Profile" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# ==============================================================================
# PHASE 5: TEMPLATE CLONING (BOB)
# ==============================================================================

Write-TestHeader "PHASE 5: TEMPLATE CLONING (BOB)"

# Test 5.1: Bob Clones Alice's Template
Write-Host "`n[TEST 5.1] Clone Template" -ForegroundColor Yellow

$cloneBody = @{
    userId = $BOB_ID
}

$headers = @{
    "X-User-Id" = $BOB_ID
    "Content-Type" = "application/json"
}

$result = Invoke-TestApi -Method POST -Endpoint "/api/feed/$FEED_ITEM_ID/clone" -Headers $headers -Body $cloneBody -TestName "Clone Template"

if ($result.Success -and $result.StatusCode -eq 200 -and $result.Content.success -eq $true) {
    Write-Pass "Template cloned successfully"
    $BOB_CLONED_PAGE_ID = $result.Content.pageId
    Log-Test "Clone Template" "PASS" "ClonedPageId: $BOB_CLONED_PAGE_ID"
    $testResults.PassedTests++
} else {
    Write-Fail "Template cloning failed (Status: $($result.StatusCode))"
    Log-Test "Clone Template" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# Test 5.2: Verify Bob's Cloned Page in Workspace
Write-Host "`n[TEST 5.2] Verify Cloned Page Ownership" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $BOB_ID
}

$result = Invoke-TestApi -Method GET -Endpoint "/api/pages" -Headers $headers -TestName "Get Bob's Pages"

if ($result.Success -and $result.StatusCode -eq 200) {
    $bobPages = $result.Content
    if ($bobPages -is [array]) {
        $clonedPage = $bobPages | Where-Object { $_.id -eq $BOB_CLONED_PAGE_ID }
        if ($clonedPage) {
            if ($clonedPage.userId -eq $BOB_ID) {
                Write-Pass "Cloned page found in Bob's workspace with correct ownership"
                Log-Test "Verify Cloned Page" "PASS" "Bob owns cloned page"
                $testResults.PassedTests++
            } else {
                Write-Fail "Cloned page found but wrong owner: $($clonedPage.userId) != $BOB_ID"
                Log-Test "Verify Cloned Page" "FAIL" "Wrong owner"
                $testResults.FailedTests++
            }
        } else {
            Write-Fail "Cloned page not found in Bob's pages"
            Log-Test "Verify Cloned Page" "FAIL" "Page not in workspace"
            $testResults.FailedTests++
        }
    } else {
        Write-Warning "Bob's pages response format unexpected"
        Log-Test "Verify Cloned Page" "WARN" "Unexpected response format"
    }
} else {
    Write-Fail "Failed to fetch Bob's pages (Status: $($result.StatusCode))"
    Log-Test "Verify Cloned Page" "FAIL" "$($result.ErrorMessage)"
    $testResults.FailedTests++
}
$testResults.TotalTests++

# ==============================================================================
# PHASE 6: MESSAGING SYSTEM CHECK
# ==============================================================================

Write-TestHeader "PHASE 6: MESSAGING SYSTEM CHECK"

# Test 6.1: Check for Message Endpoints
Write-Host "`n[TEST 6.1] Search for Messaging Endpoints" -ForegroundColor Yellow

$messagingEndpoints = @(
    "/api/messages",
    "/api/chat",
    "/api/direct-messages",
    "/api/users/$ALICE_ID/message"
)

$messagingFound = $false

foreach ($endpoint in $messagingEndpoints) {
    $result = Invoke-TestApi -Method POST -Endpoint $endpoint -Body @{} -TestName "Check Messaging"
    
    if ($result.StatusCode -ne 404 -and $result.StatusCode -ne 0) {
        $messagingFound = $true
        Write-Info "Found messaging endpoint: $endpoint (Status: $($result.StatusCode))"
        Log-Test "Messaging Check" "INFO" "Endpoint found: $endpoint"
    }
}

if ($messagingFound) {
    Write-Pass "Messaging system appears to be implemented"
    Log-Test "Messaging Check" "PASS" "Messaging endpoints found"
    $testResults.PassedTests++
} else {
    Write-Warning "NO MESSAGING ENDPOINTS FOUND - Messaging system NOT IMPLEMENTED"
    Log-Test "Messaging Check" "NOT_IMPLEMENTED" "No messaging endpoints available"
}
$testResults.TotalTests++

# ==============================================================================
# TEST SUMMARY
# ==============================================================================

Write-TestHeader "TEST EXECUTION SUMMARY"

Write-Host "Total Tests: $($testResults.TotalTests)" -ForegroundColor Cyan
Write-Host "Passed: $($testResults.PassedTests)" -ForegroundColor Green
Write-Host "Failed: $($testResults.FailedTests)" -ForegroundColor $(if ($testResults.FailedTests -gt 0) { "Red" } else { "Green" })

$passPercentage = if ($testResults.TotalTests -gt 0) { [math]::Round(($testResults.PassedTests / $testResults.TotalTests) * 100, 2) } else { 0 }
Write-Host "Pass Rate: $passPercentage%" -ForegroundColor $(if ($passPercentage -ge 80) { "Green" } else { "Yellow" })

Write-Host "`nEnd Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "Test Results logged to: $LogFile" -ForegroundColor Cyan

# Test Variables for Reference
Write-Host "`n" -ForegroundColor Cyan
Write-Host "TEST VARIABLES (for manual API testing):" -ForegroundColor Cyan
Write-Host "ALICE_ID: $ALICE_ID" -ForegroundColor Gray
Write-Host "ALICE_TOKEN: $($ALICE_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "ALICE_PAGE_ID: $ALICE_PAGE_ID" -ForegroundColor Gray
Write-Host "BOB_ID: $BOB_ID" -ForegroundColor Gray
Write-Host "BOB_TOKEN: $($BOB_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "FEED_ITEM_ID: $FEED_ITEM_ID" -ForegroundColor Gray
Write-Host "BOB_CLONED_PAGE_ID: $BOB_CLONED_PAGE_ID" -ForegroundColor Gray

Write-Host "`nFor detailed results, review: $LogFile" -ForegroundColor Cyan
