# Helper script to find and start MongoDB
$commonPaths = @(
    "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe"
)

Write-Host "🔍 Searching for MongoDB..." -ForegroundColor Cyan

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found MongoDB at: $path" -ForegroundColor Green
        Write-Host "🚀 Starting MongoDB..." -ForegroundColor Yellow
        # Initialize default db path if it doesn't exist
        $dbPath = "C:\data\db"
        if (-not (Test-Path $dbPath)) {
            Write-Host "Creating default database directory at $dbPath"
            New-Item -ItemType Directory -Force -Path $dbPath | Out-Null
        }
        
        # Start mongod
        & $path
        exit
    }
}

# If we get here, we didn't find it in common paths
Write-Host "⚠️ Could not find mongod.exe in standard locations." -ForegroundColor Red
Write-Host "Please check where you installed MongoDB and add it to your PATH."
