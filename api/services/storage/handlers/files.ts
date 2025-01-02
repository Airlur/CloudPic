import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../../auth/middleware';
import { db } from '../../db/client';
import { StorageFactory } from '../storage-factory';
import { ResponseCode } from '../../../../src/constants/httpCode';

export default withAuth(async function filesHandler(
  req: AuthenticatedRequest, 
  res: VercelResponse
): Promise<VercelResponse> {
  const method = req.method;
  
  try {
    if (method === 'GET') {
      const connectionId = req.query.connectionId as string;
      const prefix = req.query.prefix as string | undefined;
      
      if (!connectionId) {
        return res.status(400).json({
          code: ResponseCode.BAD_REQUEST,
          message: 'response.error.missingConnectionId',
          data: null
        });
      }

      const connection = await db.query(
        'SELECT type, credentials, auth_info FROM storage_connections WHERE id = $1',
        [connectionId]
      ) as any[];

      if (connection.length === 0) {
        return res.status(404).json({
          code: ResponseCode.NOT_FOUND,
          message: 'response.error.connectionNotFound',
          data: null
        });
      }

      const { type, credentials, auth_info } = connection[0];
      
      // 解析认证信息，只保留必要的字段
      const parsedCredentials = typeof credentials === 'string' 
        ? JSON.parse(credentials) 
        : credentials;
      const parsedAuthInfo = typeof auth_info === 'string' 
        ? JSON.parse(auth_info) 
        : auth_info;

      try {
        const service = StorageFactory.create({
          type,
          credentials: {
            accessKey: parsedCredentials.accessKey,
            secretKey: parsedCredentials.secretKey
          }
        });
        
        Object.assign(service, { authInfo: parsedAuthInfo });
        const files = await service.listFiles(prefix);
        
        return res.status(200).json({
          code: ResponseCode.SUCCESS,
          message: 'response.success.filesListed',
          data: { files }
        });
      } catch (error: any) {
        return res.status(400).json({
          code: ResponseCode.BAD_REQUEST,
          message: 'response.error.listFilesFailed',
          data: { error: error.message }
        });
      }
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
}); 