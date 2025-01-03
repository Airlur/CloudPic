import { db } from '../../db/client';
import { StorageFactory } from '../storage-factory'
import { StorageConnection } from '../storage-service.types';
import { nanoid } from 'nanoid';
import { ResponseCode } from '../../../../src/constants/httpCode';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../../auth/middleware';

interface StorageConnectionPreview {
  id: string;
  name: string;
  type: 'b2' | 'r2' | 's3';
  settings?: StorageConnection['settings'];
  created_at: Date;
  updated_at: Date;
}

// 存储服务处理器
export default withAuth(async function handler(
  req: AuthenticatedRequest, 
  res: VercelResponse
): Promise<VercelResponse> {
  const method = req.method;
  const url = new URL(req.url!, `http://${req.headers.host}`);

  try {
    // 测试连接并保存
    if (method === 'POST' && url.pathname.endsWith('/test')) {
      const { type, credentials } = req.body;
      try {
        const service = StorageFactory.create({ type, credentials });
        const authInfo = await service.connect();
        
        const name = credentials.bucket;
        const id = nanoid();

        await db.query(
          `INSERT INTO storage_connections 
           (id, name, type, credentials, auth_info) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id, name, type, JSON.stringify(credentials), JSON.stringify(service.getAuthInfo())]
        );

        return res.status(200).json({
          code: ResponseCode.SUCCESS,
          message: 'response.success.connectionTest',
          data: { 
            success: true,
            id,  // 返回 id 供后续使用
            name,
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
        `SELECT id, name, type, settings, created_at, updated_at
         FROM storage_connections 
         ORDER BY created_at DESC`
      ) as StorageConnectionPreview[];

      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionsRetrieved',
        data: connections
      });
    }

    // 添加新连接
    if (method === 'POST') {
      const { type, credentials } = req.body;
      const name = credentials.bucket;
      
      try {
        // 检查是否存在同类型的同名存储桶
        const existingConnection = await db.query(
          'SELECT name FROM storage_connections WHERE name = $1 AND type = $2',
          [name, type]
        ) as StorageConnection[];
        
        if (existingConnection.length > 0) {
          return res.status(400).json({
            code: ResponseCode.BAD_REQUEST,
            message: 'response.error.duplicateConnection',
            data: { 
              error: 'response.error.bucketExists',
              name,
              type,
              existingName: existingConnection[0].name
            }
          });
        }

        // 测试连接
        const service = StorageFactory.create({ type, credentials });
        const authInfo = await service.connect();
        
        const id = nanoid();
        
        await db.query(
          `INSERT INTO storage_connections 
           (id, name, type, credentials, auth_info) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id, name, type, JSON.stringify(credentials), JSON.stringify(service.getAuthInfo())]
        );

        return res.status(200).json({
          code: ResponseCode.SUCCESS,
          message: 'response.success.connectionCreated',
          data: { 
            name,
            type,
            auth_info: authInfo,
            created_at: new Date()
          }
        });
      } catch (error: any) {
        // 这里只处理真正的连接错误
        return res.status(400).json({
          code: ResponseCode.BAD_REQUEST,
          message: 'response.error.connectionCreationFailed',
          data: { error: error.message }
        });
      }
    }

    // 删除连接
    if (method === 'DELETE') {
      const { type, name } = req.body;
      
      if (!type || !name) {
        return res.status(400).json({
          code: ResponseCode.BAD_REQUEST,
          message: 'response.error.missingParams',
          data: null
        });
      }

      const result = await db.query(
        'DELETE FROM storage_connections WHERE type = $1 AND name = $2 RETURNING name', 
        [type, name]
      ) as any[];
      
      if (result.length === 0) {
        return res.status(404).json({
          code: ResponseCode.NOT_FOUND,
          message: 'response.error.connectionNotFound',
          data: null
        });
      }

      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.connectionDeleted',
        data: { 
          name: result[0].name,
          type: type
        }
      });
    }

    // 处理未定义的请求方法
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
}); 