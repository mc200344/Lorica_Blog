@echo off
chcp 65001 >nul
title NeteaseCloudMusicApi Launcher
echo ============================================
echo   NeteaseCloudMusicApi Launcher
echo   网易云 API 代理服务启动器
echo ============================================
echo.

rem Check if port 3000 is already in use
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] The API service is already running on port 3000.
    echo [OK] 网易云 API 服务已在运行（端口 3000）。
    echo.
    echo If the player still fails to load, check the apiBase setting
    echo at the top of src/components/Player.astro.
    echo 如果播放器仍加载失败，请检查 Player.astro 顶部的 apiBase 配置。
    pause
    exit /b 0
)

rem Locate the API installation directory
set "API_DIR=D:\deepseek work\NeteaseCloudMusicApi"
if not exist "%API_DIR%\node_modules\NeteaseCloudMusicApi\app.js" (
    echo [ERROR] API service not found at: %API_DIR%
    echo [错误] 未找到 API 服务，安装目录: %API_DIR%
    echo.
    echo Install it first with:
    echo   cd /d "%API_DIR%"
    echo   npm i NeteaseCloudMusicApi --ignore-scripts
    pause
    exit /b 1
)

echo Starting NeteaseCloudMusicApi on http://localhost:3000 ...
echo 正在启动网易云 API 服务（http://localhost:3000）...
echo Closing this window stops the service.
echo 关闭本窗口即停止服务。
echo.
cd /d "%API_DIR%"
node node_modules\NeteaseCloudMusicApi\app.js
pause
