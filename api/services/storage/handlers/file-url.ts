import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../../auth/middleware';
import { db } from '../../db/client';
import { StorageFactory } from '../storage-factory';
import { ResponseCode } from '../../../../src/constants/httpCode';

export default withAuth(async function getFileUrlHandler(
  req: AuthenticatedRequest, 
  res: VercelResponse
): Promise<VercelResponse> {
  const { connectionId, path, expiresIn = 3600 } = req.query;
  
  if (!connectionId || !path) {
    return res.status(400).json({
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.missingParams',
      data: null
    });
  }

  try {
    const connection = await db.query(
      'SELECT type, credentials, auth_info FROM storage_connections WHERE id = $1',
      [connectionId]
    );

    if (connection.length === 0) {
      return res.status(404).json({
        code: ResponseCode.NOT_FOUND,
        message: 'response.error.connectionNotFound',
        data: null
      });
    }

    const { type, credentials, auth_info } = connection[0];
    const parsedCredentials = typeof credentials === 'string' 
      ? JSON.parse(credentials) 
      : credentials;

    const service = StorageFactory.create({
      type,
      credentials: {
        accessKey: parsedCredentials.accessKey,
        secretKey: parsedCredentials.secretKey
      }
    });

    if (!auth_info) {
      await service.connect();
    } else {
      const parsedAuthInfo = typeof auth_info === 'string' 
        ? JSON.parse(auth_info) 
        : auth_info;
      Object.assign(service, { authInfo: parsedAuthInfo });
    }

    const url = service.getFileUrl(path as string, Number(expiresIn));
    
    return res.status(200).json({
      code: ResponseCode.SUCCESS,
      message: 'response.success.fileUrlGenerated',
      data: { 
        url,
        expiresIn: Number(expiresIn)
      }
    });
  } catch (error: any) {
    console.error('Failed to generate file URL:', error);
    return res.status(400).json({
      code: ResponseCode.BAD_REQUEST,
      message: 'response.error.fileUrlGenerationFailed',
      data: { error: error.message }
    });
  }
}); 