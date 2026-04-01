# 数据库初始化指南

本目录包含PostgreSQL数据库的初始化脚本和种子数据。

## 前提条件

1. 已安装PostgreSQL数据库（建议版本13或更高）
2. PostgreSQL服务正在运行
3. 已创建PostgreSQL用户（默认用户名: postgres）

## 数据库配置

数据库配置在 `app/core/config.py` 中：

```python
POSTGRES_SERVER: str = "localhost"
POSTGRES_USER: str = "postgres"
POSTGRES_PASSWORD: str = "postgres"
POSTGRES_DB: str = "auto_bookkeeping"
POSTGRES_PORT: int = 5432
```

您可以通过环境变量 `.env` 文件覆盖这些配置：

```
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=auto_bookkeeping
POSTGRES_PORT=5432
```

## 初始化步骤

### 方法1：使用Python脚本（推荐）

1. 确保已安装必要的依赖：

```bash
cd backend
pip install psycopg2-binary
```

2. 运行初始化脚本：

```bash
cd scripts
python init_database.py
```

该脚本会自动：
- 创建数据库
- 创建所有表结构
- 插入初始数据

### 方法2：手动执行SQL文件

1. 创建数据库：

```bash
psql -U postgres -c "CREATE DATABASE auto_bookkeeping;"
```

2. 执行表结构创建脚本：

```bash
psql -U postgres -d auto_bookkeeping -f init_db.sql
```

3. 执行种子数据插入脚本：

```bash
psql -U postgres -d auto_bookkeeping -f seed_data.sql
```

## 数据库结构

### 主要表

- **users**: 用户表（管理员和普通用户）
- **customers**: 客户表
- **files**: 文件表
- **ocr_results**: OCR结果表
- **account_subjects**: 会计科目表
- **classification_rules**: 分类规则表
- **export_templates**: 导出模板表
- **export_logs**: 导出日志表
- **ocr_tasks**: OCR任务表
- **audit_logs**: 审计日志表

### 初始数据

脚本会插入以下初始数据：

1. **用户**
   - 管理员用户 (admin@example.com / admin123)
   - 普通用户 (user@example.com / admin123)

2. **客户**
   - 5个示例客户数据

3. **会计科目**
   - 资产类科目（现金、預金、売掛金等）
   - 负债类科目（買掛金、未払金等）
   - 权益类科目（資本金、利益剰余金等）
   - 收入类科目（売上、雑収入等）
   - 费用类科目（仕入、給料手当、旅費交通費等）

4. **分类规则**
   - 旅費交通費规则
   - 通信費规则
   - 広告宣伝費规则
   - 消耗品費规则
   - 水道光熱費规则
   - 給料手当规则
   - 売上规则
   - 仕入规则

5. **导出模板**
   - 標準CSV出力（默认模板）
   - 会計ソフト用CSV

6. **审计日志**
   - 示例审计日志记录

## 注意事项

1. 生产环境中，请务必修改默认密码
2. 定期备份数据库
3. 根据实际需求调整初始数据
4. 可以根据需要修改 `init_db.sql` 和 `seed_data.sql` 文件

## 故障排除

### 连接失败

如果遇到连接错误，请检查：
1. PostgreSQL服务是否正在运行
2. 用户名和密码是否正确
3. 数据库端口是否正确（默认5432）
4. 防火墙设置

### 权限问题

确保PostgreSQL用户有足够的权限：
```bash
psql -U postgres -c "ALTER USER postgres WITH SUPERUSER;"
```

### 数据库已存在

如果数据库已存在，脚本会跳过创建步骤。如需重新创建：
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS auto_bookkeeping;"
```
