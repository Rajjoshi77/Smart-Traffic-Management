# ================================
# Activate virtual environment
# ================================
.\venv\Scripts\Activate.ps1

# ================================
# Set Java 17 ONLY for this project session
# ================================
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# ================================
# Set Python for PySpark (venv)
# ================================
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$PYTHON_PATH = "$PROJECT_ROOT\venv\Scripts\python.exe"

$env:PYSPARK_PYTHON = $PYTHON_PATH
$env:PYSPARK_DRIVER_PYTHON = $PYTHON_PATH

# ================================
# Info
# ================================
Write-Host "Project environment ready (venv + Java 17 + PySpark)" -ForegroundColor Green

Write-Host ""
Write-Host "Versions:" -ForegroundColor Cyan
python --version
java -version
