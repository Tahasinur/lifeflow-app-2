#!/usr/bin/env pwsh

# Test script for Chat API endpoints
# This script tests all 22 chat API endpoints

$BASE_URL = "http://localhost:8080/api"
$TOKEN = "test-token"
$USER_ID = "1"
$TARGET_USER_ID = "2"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Chat API Endpoint Testing Suite" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Helper function for API calls
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$TestName,
        [object]$Body = $null
    )
    
    $url = "$BASE_URL$Endpoint"
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    Write-Host "Method: $Method | URL: $url"
    
    try {
        $headers = @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        }
        
        if ($Body) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -ErrorAction Continue
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -ErrorAction Continue
        }
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host ""
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "✗ Error: $($_)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test 1: Get Conversations
Write-Host "1. CONVERSATION OPERATIONS" -ForegroundColor Cyan
Write-Host "---" -ForegroundColor Cyan
$conv = Test-Endpoint -Method "GET" -Endpoint "/messages/conversations" -TestName "Get all conversations"

# Test 2: Get Conversation Previews
$previews = Test-Endpoint -Method "GET" -Endpoint "/messages/conversations/preview" -TestName "Get conversation previews"

# Test 3: Create Direct Conversation
$directConvBody = @{ userId = $TARGET_USER_ID }
$directConv = Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/direct" -TestName "Create direct conversation" -Body $directConvBody
$conversationId = $directConv.id

if ($conversationId) {
    # Test 4: Get specific conversation
    Test-Endpoint -Method "GET" -Endpoint "/messages/conversations/$conversationId" -TestName "Get specific conversation"
    
    # Test 5: Create Group Conversation
    $groupBody = @{
        name = "Test Group"
        description = "Test group conversation"
        participantIds = @($TARGET_USER_ID)
    }
    $groupConv = Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/group" -TestName "Create group conversation" -Body $groupBody
    $groupConversationId = $groupConv.id
    
    # Test 6: Update Conversation
    $updateBody = @{
        name = "Updated Group"
        description = "Updated description"
    }
    Test-Endpoint -Method "PATCH" -Endpoint "/messages/conversations/$groupConversationId" -TestName "Update conversation" -Body $updateBody
    
    Write-Host ""
    Write-Host "2. MESSAGE OPERATIONS" -ForegroundColor Cyan
    Write-Host "---" -ForegroundColor Cyan
    
    # Test 7: Send Message
    $messageBody = @{ content = "Hello, this is a test message!" }
    $message = Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/$conversationId/messages" -TestName "Send message" -Body $messageBody
    $messageId = $message.id
    
    # Test 8: Get Messages
    Test-Endpoint -Method "GET" -Endpoint "/messages/conversations/$conversationId/messages?limit=10&offset=0" -TestName "Get messages from conversation"
    
    if ($messageId) {
        # Test 9: Edit Message
        $editBody = @{ content = "Updated message content" }
        Test-Endpoint -Method "PATCH" -Endpoint "/messages/conversations/$conversationId/messages/$messageId" -TestName "Edit message" -Body $editBody
        
        Write-Host ""
        Write-Host "3. REACTION OPERATIONS" -ForegroundColor Cyan
        Write-Host "---" -ForegroundColor Cyan
        
        # Test 10: Add Reaction
        $reactionBody = @{ emoji = "👍" }
        Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/$conversationId/messages/$messageId/reactions" -TestName "Add reaction to message" -Body $reactionBody
        
        # Test 11: Remove Reaction
        Test-Endpoint -Method "DELETE" -Endpoint "/messages/conversations/$conversationId/messages/$messageId/reactions/%F0%9F%91%8D" -TestName "Remove reaction from message"
    }
    
    # Test 12: Mark as Read
    Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/$conversationId/read" -TestName "Mark conversation as read"
    
    if ($messageId) {
        # Test 13: Delete Message
        Test-Endpoint -Method "DELETE" -Endpoint "/messages/conversations/$conversationId/messages/$messageId" -TestName "Delete message"
    }
    
    # Test 14: Archive Conversation
    Test-Endpoint -Method "POST" -Endpoint "/messages/conversations/$conversationId/archive" -TestName "Archive conversation"
    
    # Test 15: Delete Conversation
    Test-Endpoint -Method "DELETE" -Endpoint "/messages/conversations/$conversationId" -TestName "Delete conversation"
}

Write-Host ""
Write-Host "4. STATS AND SEARCH" -ForegroundColor Cyan
Write-Host "---" -ForegroundColor Cyan

# Test 16: Get Inbox Stats
Test-Endpoint -Method "GET" -Endpoint "/messages/stats" -TestName "Get inbox stats"

# Test 17: Search Messages
Test-Endpoint -Method "GET" -Endpoint "/messages/search?q=test" -TestName "Search messages"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
