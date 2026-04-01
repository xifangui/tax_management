@echo off
chcp 65001 >nul
echo ========================================
echo 数据库初始化脚本
echo ========================================
echo.

cd /d "%~dp0.."

echo 正在检查Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python
    pause
    exit /b 1
)

echo 正在安装后端依赖...
pip install -r requirements.txt
if errorlevel 1 (
    echo 错误: 安装依赖失败
    pause
    exit /b 1
)

echo.
echo 开始初始化数据库...
echo.

cd scripts
python init_database.py

if errorlevel 1 (
    echo.
    echo 数据库初始化失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 数据库初始化成功完成！
echo ========================================
echo.
pause
