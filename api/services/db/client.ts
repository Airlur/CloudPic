import { sql } from '@vercel/postgres';
import Database from 'sqlite3';
import { open } from 'sqlite';
import * as fs from 'fs';
import * as path from 'path';

const isDev = !process.env.VERCEL;

const getSqliteDb = async () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  return open({
    filename: path.join(dataDir, 'cloudpic.db'),
    driver: Database.Database
  });
};

const db = {
  async query(sqlString: string, params: any[] = []) {
    if (isDev) {
      const sqliteDb = await getSqliteDb();
      return sqliteDb.all(sqlString, params);
    }
    const result = await sql`${sqlString}`;
    return result.rows;
  }
};

// 初始化数据库
if (isDev) {
  getSqliteDb().then(async (sqliteDb) => {
    const schema = fs.readFileSync(
      path.join(process.cwd(), 'api/services/db/schema.sql'),
      'utf-8'
    );
    await sqliteDb.exec(schema);
  }).catch(console.error);
}

export { db }; 