@echo off
REM HDFS Startup Script for Windows
REM This script initializes HDFS namenode and datanode for distributed storage

setlocal enabledelayedexpansion

REM Colors for output
echo.
echo ========================================
echo  HDFS STARTUP SCRIPT - SMART TRAFFIC
echo ========================================
echo.

REM Check if Hadoop is installed
if "%HADOOP_HOME%"=="" (
    echo [ERROR] HADOOP_HOME environment variable not set
    echo Please set HADOOP_HOME to your Hadoop installation directory
    echo Example: C:\hadoop
    pause
    exit /b 1
)

echo [INFO] HADOOP_HOME: %HADOOP_HOME%
echo [INFO] JAVA_HOME: %JAVA_HOME%
echo.

REM Check if Java is available
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not available. Please install Java 8 or higher.
    pause
    exit /b 1
)

echo [INFO] Java is available
echo.

REM Create necessary directories
echo [INFO] Creating HDFS data directories...
if not exist "%HADOOP_HOME%\data\namenode" mkdir "%HADOOP_HOME%\data\namenode"
if not exist "%HADOOP_HOME%\data\datanode" mkdir "%HADOOP_HOME%\data\datanode"

REM Format namenode (first time only)
echo [WARNING] If this is the first run, namenode will be formatted
echo [WARNING] This will erase all existing HDFS data!
echo.
set /p format="Do you want to format the namenode? (y/n) "
if /i "%format%"=="y" (
    echo [INFO] Formatting HDFS namenode...
    cd /d "%HADOOP_HOME%\bin"
    call hdfs namenode -format -force
    echo [INFO] Namenode formatted successfully
    echo.
)

REM Start HDFS services
echo [INFO] Starting HDFS services...
echo [INFO] This will open new terminal windows
echo.

REM Start NameNode
echo [INFO] Starting NameNode...
start "HDFS NameNode" cmd /k "cd /d %HADOOP_HOME%\bin && hdfs namenode"

REM Wait for NameNode to start
echo [INFO] Waiting for NameNode to start...
timeout /t 5 /nobreak

REM Start DataNode
echo [INFO] Starting DataNode...
start "HDFS DataNode" cmd /k "cd /d %HADOOP_HOME%\bin && hdfs datanode"

REM Wait for DataNode to start
echo [INFO] Waiting for DataNode to start...
timeout /t 3 /nobreak

REM Create default directories
echo [INFO] Creating traffic data directories in HDFS...
cd /d "%HADOOP_HOME%\bin"
call hdfs dfs -mkdir -p /traffic/data 2>nul
call hdfs dfs -mkdir -p /traffic/analytics 2>nul
call hdfs dfs -mkdir -p /traffic/results 2>nul

echo.
echo ========================================
echo  HDFS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo [INFO] NameNode Web UI: http://localhost:9870
echo [INFO] DataNode Web UI: http://localhost:9864
echo.
echo [INFO] HDFS directories created:
echo         /traffic/data
echo         /traffic/analytics
echo         /traffic/results
echo.
echo [INFO] Commands to verify:
echo         hdfs dfs -ls /traffic/
echo         hdfs dfsadmin -report
echo.
echo Press any key to continue...
pause

endlocal
