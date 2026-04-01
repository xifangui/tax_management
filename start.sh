#!/bin/bash

# Auto Bookkeeping 启动脚本

echo "========================================"
echo "Auto Bookkeeping 启动脚本"
echo "========================================"
echo ""

# 获取脚本所在目录
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 启动后端
echo "[1/2] 正在启动后端服务..."
cd "$PROJECT_ROOT/backend"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 等待后端启动
echo "等待后端服务启动..."
sleep 3

# 启动前端
echo "[2/2] 正在启动前端服务..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "后端和前端服务已启动！"
echo "========================================"
echo ""
echo "后端地址: http://127.0.0.1:8000"
echo "前端地址: http://localhost:5173"
echo ""
echo "API文档: http://127.0.0.1:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
