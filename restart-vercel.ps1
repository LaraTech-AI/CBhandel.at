# PowerShell script to restart Vercel dev server

Write-Host "Stopping Vercel dev server on port 3000..." -ForegroundColor Yellow

# Kill process on port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    $pid = $process.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "Process $pid stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No process found on port 3000" -ForegroundColor Yellow
}

Write-Host "Starting Vercel dev server..." -ForegroundColor Yellow
npm run dev:vercel

