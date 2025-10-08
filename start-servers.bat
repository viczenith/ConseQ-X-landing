@echo off
echo Starting ConseQ-X Dashboard Servers...
echo.

echo Starting Mock WebSocket Server (Port 4002)...
start "WebSocket Server" cmd /k "cd /d "%~dp0" && node server/mockWsServer.js"

echo.
echo Starting Mock API Server (Port 4001)...
start "API Server" cmd /k "cd /d "%~dp0" && node server/mockApi.js"

echo.
echo ✅ Servers starting in separate windows
echo ✅ WebSocket Server: ws://localhost:4002
echo ✅ API Server: http://localhost:4001
echo.
echo 🔄 Refresh your dashboard to see the connection status change to "Connected"
echo.
pause