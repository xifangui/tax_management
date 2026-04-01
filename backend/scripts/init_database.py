import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings


def create_database():
    """创建数据库"""
    try:
        # 连接到PostgreSQL服务器
        conn = psycopg2.connect(
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # 检查数据库是否存在
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'")
        exists = cursor.fetchone()

        if not exists:
            # 创建数据库
            cursor.execute(f"CREATE DATABASE {settings.POSTGRES_DB}")
            print(f"数据库 {settings.POSTGRES_DB} 创建成功")
        else:
            print(f"数据库 {settings.POSTGRES_DB} 已存在")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"创建数据库时出错: {e}")
        sys.exit(1)


def execute_sql_file(sql_file_path: str):
    """执行SQL文件"""
    try:
        # 连接到目标数据库
        conn = psycopg2.connect(
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB
        )
        cursor = conn.cursor()

        # 读取SQL文件
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # 执行SQL语句
        cursor.execute(sql_content)
        conn.commit()

        print(f"成功执行SQL文件: {sql_file_path}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"执行SQL文件时出错: {e}")
        sys.exit(1)


def main():
    """主函数"""
    print("开始初始化数据库...")

    # 创建数据库
    create_database()

    # 执行表结构创建脚本
    init_db_path = project_root / "scripts" / "init_db.sql"
    if init_db_path.exists():
        execute_sql_file(str(init_db_path))
    else:
        print(f"警告: SQL文件不存在: {init_db_path}")

    # 执行种子数据插入脚本
    seed_db_path = project_root / "scripts" / "seed_data.sql"
    if seed_db_path.exists():
        execute_sql_file(str(seed_db_path))
    else:
        print(f"警告: SQL文件不存在: {seed_db_path}")

    print("数据库初始化完成!")


if __name__ == "__main__":
    main()
