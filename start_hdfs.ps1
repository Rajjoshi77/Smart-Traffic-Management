# ============================================================
# HDFS Startup Script for Windows PowerShell
# Smart Traffic Management Project
# ============================================================
# What this script does (in order):
#   1. Checks HADOOP_HOME / JAVA_HOME / java binary
#   2. Kills any stale Java/HDFS processes
#   3. Checks HDFS health - only reformats if CORRUPT (no VERSION file)
#      *** Existing data is PRESERVED on normal restarts ***
#   4. Starts NameNode, waits until port 9000 is open
#   5. Starts DataNode, waits until port 9866 is open
#   6. Verifies at least 1 live DataNode via dfsadmin -report
#   7. Creates /traffic/* directories (skipped if already exist)
# ============================================================
#
# Use --force-reformat flag ONLY if you want to wipe all data:
#   .\start_hdfs.ps1 --force-reformat
# ============================================================

$ErrorActionPreference = "Continue"

# Check for --force-reformat flag
$ForceReformat = $args -contains "--force-reformat"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HDFS STARTUP - SMART TRAFFIC PROJECT  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ----------------------------------------------------------
# STEP 1: CHECK PREREQUISITES
# ----------------------------------------------------------

if (-not $env:HADOOP_HOME) {
    Write-Host "[ERROR] HADOOP_HOME is not set." -ForegroundColor Red
    Write-Host "        Example: Set it to C:\hadoop" -ForegroundColor Yellow
    exit 1
}

if (-not $env:JAVA_HOME) {
    Write-Host "[ERROR] JAVA_HOME is not set." -ForegroundColor Red
    exit 1
}

$hadoopBin = "$($env:HADOOP_HOME)\bin"
$hdfsCmd   = "$hadoopBin\hdfs.cmd"

if (-not (Test-Path $hdfsCmd)) {
    Write-Host "[ERROR] hdfs.cmd not found at: $hdfsCmd" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] HADOOP_HOME : $($env:HADOOP_HOME)" -ForegroundColor Green
Write-Host "[OK] JAVA_HOME   : $($env:JAVA_HOME)" -ForegroundColor Green

try {
    $jv = java -version 2>&1 | Select-String "version"
    Write-Host "[OK] Java        : $jv" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Java not found in PATH." -ForegroundColor Red
    exit 1
}

# ----------------------------------------------------------
# STEP 2: KILL STALE JAVA / HDFS PROCESSES
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 2] Killing any stale Java processes..." -ForegroundColor Yellow

$javaProcs = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcs) {
    $javaProcs | Stop-Process -Force
    Write-Host "  [OK] Killed $($javaProcs.Count) Java process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 3
} else {
    Write-Host "  [OK] No stale Java processes found" -ForegroundColor Green
}

# ----------------------------------------------------------
# STEP 3: CHECK HDFS HEALTH (only reformat if corrupt)
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 3] Checking HDFS namenode state..." -ForegroundColor Yellow

$nameCurrent = "$($env:HADOOP_HOME)\data\namenode\current"
$dataDir     = "$($env:HADOOP_HOME)\data\datanode"
$nameDir     = "$($env:HADOOP_HOME)\data\namenode"
$versionFile = "$nameCurrent\VERSION"

$hdfsHealthy = (Test-Path $versionFile)

if ($ForceReformat) {
    Write-Host "  [WARN] --force-reformat flag detected. ALL HDFS DATA WILL BE WIPED!" -ForegroundColor Red
    Write-Host "  [WARN] Press Ctrl+C within 5 seconds to cancel..." -ForegroundColor Red
    Start-Sleep -Seconds 5
    $hdfsHealthy = $false
}

if ($hdfsHealthy) {
    Write-Host "  [OK] HDFS NameNode state is healthy (VERSION file exists)" -ForegroundColor Green
    Write-Host "  [OK] Skipping format - your existing data is PRESERVED" -ForegroundColor Green
    Write-Host "  [INFO] Data directory: $dataDir" -ForegroundColor Cyan
    Write-Host "  [INFO] To wipe data and start fresh, run: .\start_hdfs.ps1 --force-reformat" -ForegroundColor Cyan
} else {
    if (-not $ForceReformat) {
        Write-Host "  [WARN] NameNode VERSION file missing - HDFS appears corrupt or unformatted" -ForegroundColor Yellow
        Write-Host "  [INFO] Performing fresh format (this is safe - no valid data existed)" -ForegroundColor Yellow
    }

    # Clean old dirs
    if (Test-Path $nameCurrent) {
        Remove-Item -Recurse -Force $nameCurrent -ErrorAction SilentlyContinue
        Write-Host "  [OK] Removed: $nameCurrent" -ForegroundColor Green
    }
    if (Test-Path $dataDir) {
        Remove-Item -Recurse -Force $dataDir -ErrorAction SilentlyContinue
        Write-Host "  [OK] Removed: $dataDir" -ForegroundColor Green
    }

    New-Item -ItemType Directory -Path $nameDir -Force | Out-Null
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "  [OK] Recreated base data directories" -ForegroundColor Green

    # Format NameNode
    Write-Host "  Formatting NameNode..." -ForegroundColor Yellow
    Push-Location $hadoopBin
    & .\hdfs.cmd namenode -format -force 2>&1 | Out-Null
    Pop-Location

    if (Test-Path $versionFile) {
        Write-Host "  [OK] NameNode formatted successfully" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] VERSION file not found after format - continuing anyway" -ForegroundColor Yellow
    }
}

# ----------------------------------------------------------
# STEP 5: START NAMENODE AND WAIT FOR PORT 9000
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 5] Starting NameNode..." -ForegroundColor Yellow

$nnScript = "cd '$hadoopBin'; .\hdfs.cmd namenode"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $nnScript -WindowStyle Minimized

Write-Host "  Waiting for NameNode RPC on port 9000..." -ForegroundColor Gray

$maxWait = 60
$waited  = 0
$nnUp    = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    $conn = Test-NetConnection -ComputerName localhost -Port 9000 `
        -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        $nnUp = $true
        break
    }
}

if ($nnUp) {
    Write-Host "  [OK] NameNode is UP on port 9000 (waited ${waited}s)" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] NameNode did not start within ${maxWait}s." -ForegroundColor Red
    Write-Host "          Check the NameNode window for errors." -ForegroundColor Yellow
    exit 1
}

# ----------------------------------------------------------
# STEP 6: START DATANODE AND WAIT FOR PORT 9866
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 6] Starting DataNode..." -ForegroundColor Yellow

$dnScript = "cd '$hadoopBin'; .\hdfs.cmd datanode"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $dnScript -WindowStyle Minimized

Write-Host "  Waiting for DataNode on port 9866..." -ForegroundColor Gray

$maxWait = 60
$waited  = 0
$dnUp    = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 3
    $waited += 3
    $conn = Test-NetConnection -ComputerName localhost -Port 9866 `
        -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        $dnUp = $true
        break
    }
}

if ($dnUp) {
    Write-Host "  [OK] DataNode is UP on port 9866 (waited ${waited}s)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] DataNode port 9866 not detected yet - giving 10 more seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Extra buffer for DataNode to finish registering with NameNode
Start-Sleep -Seconds 5

# ----------------------------------------------------------
# STEP 7: VERIFY CLUSTER HEALTH
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 7] Verifying cluster health..." -ForegroundColor Yellow

Push-Location $hadoopBin
$report = & .\hdfs.cmd dfsadmin -report 2>&1
Pop-Location

$liveLine = ($report | Select-String "Live datanodes") | Select-Object -First 1

if ($liveLine) {
    $lineText = $liveLine.Line
    if ($lineText -match "(\d+)") {
        $count = [int]$Matches[1]
        if ($count -ge 1) {
            Write-Host "  [OK] $lineText" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] 0 live datanodes. DataNode failed to register." -ForegroundColor Red
            Write-Host "          Check the DataNode window for errors." -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "  [WARN] Could not parse dfsadmin report - cluster may still be initializing." -ForegroundColor Yellow
    Write-Host "         Continuing with directory creation..." -ForegroundColor Yellow
}

# ----------------------------------------------------------
# STEP 8: CREATE PROJECT HDFS DIRECTORIES
# ----------------------------------------------------------

Write-Host ""
Write-Host "[STEP 8] Creating project directories in HDFS..." -ForegroundColor Yellow

$hdfsDirs = @(
    "/traffic/data",
    "/traffic/analytics",
    "/traffic/results",
    "/traffic/checkpoints",
    "/traffic/models"
)

Push-Location $hadoopBin
foreach ($dir in $hdfsDirs) {
    & .\hdfs.cmd dfs -mkdir -p $dir 2>$null
    Write-Host "  [OK] Created: $dir" -ForegroundColor Green
}

# Set open permissions so Spark can write without permission errors
& .\hdfs.cmd dfs -chmod -R 777 /traffic 2>$null
Write-Host "  [OK] Permissions set on /traffic (777)" -ForegroundColor Green
Pop-Location

# ----------------------------------------------------------
# DONE
# ----------------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HDFS IS READY!                        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] NameNode Web UI : http://localhost:9870" -ForegroundColor Green
Write-Host "[INFO] DataNode Web UI : http://localhost:9864" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Useful commands:" -ForegroundColor Yellow
Write-Host "       hdfs dfsadmin -report          # cluster health" -ForegroundColor Cyan
Write-Host "       hdfs dfs -ls /traffic/         # list dirs" -ForegroundColor Cyan
Write-Host "       hdfs dfs -du -s -h /traffic/   # disk usage" -ForegroundColor Cyan
Write-Host ""
Write-Host "[NEXT] Run your Spark job:" -ForegroundColor Yellow
Write-Host "       python spark\generate_big_traffic_data_hdfs.py" -ForegroundColor Cyan
Write-Host ""
