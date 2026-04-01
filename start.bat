@echo off
chcp 65001 >nul
echo ========================================
echo Auto Bookkeeping 启动脚本
echo ========================================
echo.

REM 获取脚本所在目录
set PROJECT_ROOT=%~dp0

REM 启动后端
echo [1/2] 正在启动后端服务...
start "Backend Server" cmd /k "cd /d %PROJECT_ROOT%backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM 等待后端启动
echo 等待后端服务启动...
timeout /t 3 /nobreak >nul

REM 启动前端
echo [2/2] 正在启动前端服务...
start "Frontend Server" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

echo.
echo ========================================
echo 后端和前端服务已启动！
echo ========================================
echo.
echo 后端地址: http://127.0.0.1:8000
echo 前端地址: http://localhost:5173
echo.
echo API文档: http://127.0.0.1:8000/docs
echo.
echo 按任意键关闭此窗口（服务将继续运行）
pause >nul
