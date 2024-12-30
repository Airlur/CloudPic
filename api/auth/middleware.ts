import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret';

export interface AuthenticatedRequest extends VercelRequest {
  user?: { authorized: boolean };
}

export function withAuth(handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void | VercelResponse>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const token = req.cookies.token;
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { authorized: boolean };
      (req as AuthenticatedRequest).user = decoded;

      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // 尝试使用refresh token
        try {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            return res.status(401).json({ error: 'Token expired' });
          }

          const decoded = jwt.verify(refreshToken, JWT_SECRET) as { authorized: boolean };
          const newToken = jwt.sign({ authorized: decoded.authorized }, JWT_SECRET, { expiresIn: '1h' });

          res.setHeader('Set-Cookie', `token=${newToken}; HttpOnly; Path=/; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
          
          (req as AuthenticatedRequest).user = decoded;
          return handler(req as AuthenticatedRequest, res);
        } catch {
          return res.status(401).json({ error: 'Please login again' });
        }
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
} 