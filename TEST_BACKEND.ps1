#!/usr/bin/env pwsh

Write-Host "=== Lifeflow App Backend Test ===" -ForegroundColor Green
Write-Host ""

# Test 1: Check if port 8080 is listening
Write-Host "[1/4] Testing Backend Port 8080..." -ForegroundColor Yellow
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.ConnectAsync("localhost", 8080) | Wait-Job -Timeout 2 | Out-Null
    
    if ($connection.Connected) {
        Write-Host "✓ Port 8080 is listening" -ForegroundColor Green
        $connection.Close()
    } else {
        Write-Host "✗ Port 8080 is NOT listening" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Cannot connect to port 8080" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Gray
}

Write-Host ""

# Test 2: Check Java process
Write-Host "[2/4] Checking Java Process..." -ForegroundColor Yellow
$javaProcess = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcess) {
    Write-Host "✓ Java process found" -ForegroundColor Green
    Write-Host "  PID: $($javaProcess.Id)" -ForegroundColor Gray
    Write-Host "  Memory: $([math]::Round($javaProcess.WorkingSet / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "✗ No Java process running" -ForegroundColor Red
}

Write-Host ""

# Test 3: API Health Check
Write-Host "[3/4] Testing API Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/validate" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer test"} `
        -TimeoutSec 3 `
        -ErrorAction SilentlyContinue
    
    Write-Host "✓ Backend responded with status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend not responding" -ForegroundColor Red
    Write-Host "  (This is expected if backend is still starting)" -ForegroundColor Gray
}

Write-Host ""

# Test 4: Check Frontend
Write-Host "[4/4] Checking Frontend Port 5000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" `
        -TimeoutSec 3 `
        -ErrorAction SilentlyContinue
    
    Write-Host "✓ Frontend is running (status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Run the following to test login:" -ForegroundColor Yellow
Write-Host ""
Write-Host 'Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `' -ForegroundColor Magenta
Write-Host '  -Method POST `' -ForegroundColor Magenta
Write-Host '  -Headers @{"Content-Type" = "application/json"} `' -ForegroundColor Magenta
Write-Host '  -Body ''{"email":"admin@lifeflow.com","password":"admin123"}''' -ForegroundColor Magenta
