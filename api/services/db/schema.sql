-- 存储连接表
CREATE TABLE IF NOT EXISTS storage_connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('b2', 'r2', 's3')),
  credentials JSONB NOT NULL,
  settings JSONB,
  auth_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 