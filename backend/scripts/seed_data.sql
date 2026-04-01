-- 初始数据插入脚本
-- 注意：数据库连接已在init_database.py中建立

-- 插入默认管理员用户 (密码: admin123, 需要在应用中使用bcrypt加密)
INSERT INTO users (email, username, hashed_password, full_name, role, is_active) VALUES
('admin@example.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYQWz5Mq1W2', 'System Administrator', 'ADMIN', TRUE),
('user@example.com', 'user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYQWz5Mq1W2', 'Regular User', 'USER', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 插入示例客户
INSERT INTO customers (customer_code, customer_name, contact_person, email, phone, address, is_active) VALUES
('C001', '株式会社ABC', '田中 太郎', 'tanaka@abc.co.jp', '03-1234-5678', '東京都港区赤坂1-1-1', TRUE),
('C002', 'XYZ商事有限会社', '鈴木 次郎', 'suzuki@xyz.co.jp', '03-2345-6789', '東京都新宿区西新宿2-2-2', TRUE),
('C003', 'DEF産業株式会社', '佐藤 三郎', 'sato@def.co.jp', '03-3456-7890', '東京都渋谷区渋谷3-3-3', TRUE),
('C004', 'GHIサービス', '高橋 四郎', 'takahashi@ghi.co.jp', '03-4567-8901', '東京都品川区品川4-4-4', TRUE),
('C005', 'JKL物産', '伊藤 五郎', 'ito@jkl.co.jp', '03-5678-9012', '東京都目黒区目黒5-5-5', TRUE)
ON CONFLICT (customer_code) DO NOTHING;

-- 插入示例会计科目
INSERT INTO account_subjects (subject_code, subject_name, subject_type, parent_id, is_active) VALUES
-- 资产类科目
('100', '資産', 'ASSET', NULL, TRUE),
('101', '現金', 'ASSET', 1, TRUE),
('102', '預金', 'ASSET', 1, TRUE),
('103', '売掛金', 'ASSET', 1, TRUE),
('104', '商品', 'ASSET', 1, TRUE),
('105', '固定資産', 'ASSET', 1, TRUE),
-- 负债类科目
('200', '負債', 'LIABILITY', NULL, TRUE),
('201', '買掛金', 'LIABILITY', 7, TRUE),
('202', '未払金', 'LIABILITY', 7, TRUE),
('203', '借入金', 'LIABILITY', 7, TRUE),
-- 权益类科目
('300', '資本', 'EQUITY', NULL, TRUE),
('301', '資本金', 'EQUITY', 10, TRUE),
('302', '利益剰余金', 'EQUITY', 10, TRUE),
-- 收入类科目
('400', '収益', 'INCOME', NULL, TRUE),
('401', '売上', 'INCOME', 13, TRUE),
('402', '雑収入', 'INCOME', 13, TRUE),
-- 费用类科目
('500', '費用', 'EXPENSE', NULL, TRUE),
('501', '仕入', 'EXPENSE', 16, TRUE),
('502', '給料手当', 'EXPENSE', 16, TRUE),
('503', '旅費交通費', 'EXPENSE', 16, TRUE),
('504', '通信費', 'EXPENSE', 16, TRUE),
('505', '広告宣伝費', 'EXPENSE', 16, TRUE),
('506', '消耗品費', 'EXPENSE', 16, TRUE),
('507', '水道光熱費', 'EXPENSE', 16, TRUE),
('508', '事務用品費', 'EXPENSE', 16, TRUE),
('509', '修繕費', 'EXPENSE', 16, TRUE),
('510', '租税公課', 'EXPENSE', 16, TRUE),
('511', '減価償却費', 'EXPENSE', 16, TRUE),
('512', '雑費', 'EXPENSE', 16, TRUE)
ON CONFLICT (subject_code) DO NOTHING;

-- 插入示例分类规则
INSERT INTO classification_rules (rule_name, rule_type, conditions, target_subject_id, priority, is_active) VALUES
('旅費交通費ルール', 'KEYWORD', '{"keywords": ["旅費", "交通費", "新幹線", "航空券", "タクシー"]}', 18, 10, TRUE),
('通信費ルール', 'KEYWORD', '{"keywords": ["通信費", "電話代", "インターネット", "携帯"]}', 19, 10, TRUE),
('広告宣伝費ルール', 'KEYWORD', '{"keywords": ["広告", "宣伝", "マーケティング", "SNS"]}', 20, 10, TRUE),
('消耗品費ルール', 'KEYWORD', '{"keywords": ["消耗品", "事務用品", "文具"]}', 21, 10, TRUE),
('水道光熱費ルール', 'KEYWORD', '{"keywords": ["水道", "電気", "ガス", "光熱"]}', 22, 10, TRUE),
('給料手当ルール', 'KEYWORD', '{"keywords": ["給料", "手当", "賞与", "ボーナス"]}', 17, 10, TRUE),
('売上ルール', 'KEYWORD', '{"keywords": ["売上", "売上高", "収益"]}', 14, 10, TRUE),
('仕入ルール', 'KEYWORD', '{"keywords": ["仕入", "商品", "材料"]}', 17, 10, TRUE)
ON CONFLICT DO NOTHING;

-- 插入示例导出模板
INSERT INTO export_templates (template_name, description, template_type, column_mapping, encoding, is_default, status) VALUES
('標準CSV出力', '標準的なCSV出力フォーマット', 'CSV',
 '{"columns": [
   {"field": "date", "header": "日付", "format": "yyyy/MM/dd"},
   {"field": "customer_name", "header": "顧客名"},
   {"field": "subject_code", "header": "科目コード"},
   {"field": "subject_name", "header": "科目名"},
   {"field": "amount", "header": "金額", "format": "#,##0"},
   {"field": "description", "header": "摘要"}
 ]}',
 'UTF-8', TRUE, 'ACTIVE'),
('会計ソフト用CSV', '会計ソフトインポート用CSVフォーマット', 'CSV',
 '{"columns": [
   {"field": "date", "header": "伝票日付", "format": "yyyy/MM/dd"},
   {"field": "subject_code", "header": "勘定科目コード"},
   {"field": "amount", "header": "金額", "format": "0"},
   {"field": "description", "header": "摘要"},
   {"field": "tax_type", "header": "税区分"}
 ]}',
 'Shift_JIS', FALSE, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 插入示例审计日志
INSERT INTO audit_logs (operator_id, operator_name, module, action, target_id, target_name, detail, ip_address, user_agent) VALUES
(1, 'System Administrator', 'USER', 'CREATE', 1, 'admin@example.com',
 '{"email": "admin@example.com", "role": "ADMIN"}',
 '127.0.0.1', 'Mozilla/5.0'),
(1, 'System Administrator', 'CUSTOMER', 'CREATE', 1, 'C001',
 '{"customer_code": "C001", "customer_name": "株式会社ABC"}',
 '127.0.0.1', 'Mozilla/5.0'),
(1, 'System Administrator', 'SYSTEM', 'UPDATE', NULL, NULL,
 '{"settings": {"ocr.maxConcurrency": 5}}',
 '127.0.0.1', 'Mozilla/5.0');
