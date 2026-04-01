#!/bin/bash

# 数据库初始化脚本

echo "========================================"
echo "数据库初始化脚本"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查Python
echo "正在检查Python..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python，请先安装Python"
    exit 1
fi

# 检查psycopg2
echo "正在检查psycopg2..."
if ! python3 -c "import psycopg2" &> /dev/null; then
    echo "正在安装psycopg2-binary..."
    pip3 install psycopg2-binary
    if [ $? -ne 0 ]; then
        echo "错误: 安装psycopg2-binary失败"
        exit 1
    fi
fi

echo ""
echo "开始初始化数据库..."
echo ""

python3 init_database.py

if [ $? -ne 0 ]; then
    echo ""
    echo "数据库初始化失败"
    exit 1
fi

echo ""
echo "========================================"
echo "数据库初始化成功完成！"
echo "========================================"
echo ""
