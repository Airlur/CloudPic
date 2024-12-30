// api/auth/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { ResponseCode } from '../../src/constants/httpCode';

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret';
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 登录 - POST /api/auth
  if (req.method === 'POST' && req.url === '/api/auth') {
    const { password } = req.body;
    
    if (password !== process.env.ACCESS_PASSWORD) {
      return res.status(401).json({
        code: ResponseCode.UNAUTHORIZED,
        message: 'response.error.invalidPassword',
        data: null
      });
    }

    const token = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '7d' });

    res.setHeader('Set-Cookie', [
      `token=${token}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`,
      `refreshToken=${refreshToken}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`
    ]);
    
    return res.status(200).json({
      code: ResponseCode.SUCCESS,
      message: 'response.success.login',
      data: {
        authorized: true
      }
    });
  }

  // 验证 - GET /api/auth/verify
  if (req.method === 'GET' && req.url === '/api/auth/verify') {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        code: ResponseCode.UNAUTHORIZED,
        message: 'response.error.noToken',
        data: null
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({
        code: ResponseCode.SUCCESS,
        message: 'response.success.verify',
        data: {
          authorized: true
        }
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({
            code: ResponseCode.UNAUTHORIZED,
            message: 'response.error.tokenExpired',
            data: null
          });
        }

        try {
          const decoded = jwt.verify(refreshToken, JWT_SECRET);
          const newToken = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '1h' });
          
          res.setHeader('Set-Cookie', 
            `token=${newToken}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`
          );
          
          return res.status(200).json({
            code: ResponseCode.SUCCESS,
            message: 'response.success.tokenRefresh',
            data: {
              authorized: true
            }
          });
        } catch {
          return res.status(401).json({
            code: ResponseCode.UNAUTHORIZED,
            message: 'response.error.pleaseLogin',
            data: null
          });
        }
      }
      return res.status(401).json({
        code: ResponseCode.UNAUTHORIZED,
        message: 'response.error.invalidToken',
        data: null
      });
    }
  }

  // 登出 - POST /api/auth/logout
  if (req.method === 'POST' && req.url === '/api/auth/logout') {
    res.setHeader('Set-Cookie', [
      'token=; Max-Age=0; Path=/',
      'refreshToken=; Max-Age=0; Path=/'
    ]);
    return res.status(200).json({
      code: ResponseCode.SUCCESS,
      message: 'response.success.logout',
      data: {
        loggedOut: true
      }
    });
  }

  return res.status(405).json({
    code: ResponseCode.METHOD_NOT_ALLOWED,
    message: 'response.error.methodNotAllowed',
    data: null
  });
}