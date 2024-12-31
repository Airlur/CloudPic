import { db } from '../db/client';
import { StorageFactory } from './storage-factory'
import { StorageConnection } from './storage-service.types';
import { nanoid } from 'nanoid';
import { ResponseCode } from '../../../src/constants/httpCode';
import { VercelRequest, VercelResponse } from '@vercel/node';

// 存储服务处理器
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const url = new URL(req.url!, `http://${req.headers.host}`);

  try {
    // 测试连接
    if (method === 'POST' && url.pathname.endsWith('/test')) {
      const { type, credentials } = req.body;
      try {
        const service = StorageFactory.create({ type, credentials });
        const authInfo = await service.connect();
        
        // 使用 bucket 名称作为默认名称
        const name = credentials.bucket || 'Unnamed Storage';
        const id = nanoid();  // 自动生成 ID

        await db.query(
          `INSERT INTO storage_connections 
           (id, name, type, credentials, auth_info) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id,name,type,JSON.stringify(credentials),JSON.stringify(service.getAuthInfo())]
        );

        return res.status(200).json({
          code: ResponseCode.SUCCESS,
          message: 'response.success.connectionTest',
          data: { 
            success: true,
            authInfo
          }
        });
      } catch (error: any) {
        return res.status(400).json({
          code: ResponseCode.BAD_REQUEST,
          message: 'response.error.connectionTestFailed',
          data: { error: error.message }
        });
      }
    }

    // 获取存储连接列表
    if (method === 'GET') {
      const connections = await db.query(
        'SELECT id, name, type, settings FROM storage_connections ORDER BY created_at DESC'
      );
      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionsRetrieved',
        data: connections
      });
    }

    // 添加新连接
    if (method === 'POST') {
      const { name, type, credentials } = req.body;
      const id = nanoid();
      await db.query(
        `INSERT INTO storage_connections (id, name, type, credentials) 
         VALUES ($1, $2, $3, $4)`,
        [id, name, type, JSON.stringify(credentials)]
      );
      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionCreated',
        data: { id }
      });
    }

    // 更新连接
    if (method === 'PUT') {
      const id = url.pathname.split('/').pop();
      const { name, settings } = req.body;
      await db.query(
        `UPDATE storage_connections 
         SET name = COALESCE($1, name),
             settings = COALESCE($2, settings),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [name, settings ? JSON.stringify(settings) : null, id]
      );
      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionUpdated',
        data: null
      });
    }

    // 删除连接
    if (method === 'DELETE') {
      const id = url.pathname.split('/').pop();
      await db.query('DELETE FROM storage_connections WHERE id = $1', [id]);
      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionDeleted',
        data: null
      });
    }

    return res.status(405).json({
      code: ResponseCode.METHOD_NOT_ALLOWED,
      message: 'response.error.methodNotAllowed',
      data: null
    });
  } catch (error: any) {
    return res.status(500).json({
      code: ResponseCode.INTERNAL_ERROR,
      message: 'response.error.internalError',
      data: { error: error.message }
    });
  }
} 