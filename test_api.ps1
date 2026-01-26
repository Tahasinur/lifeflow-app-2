$uri = "http://localhost:8090/api/notifications/test-user-123/unread-count"
Write-Host "Testing: $uri" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $uri -Method Get
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
