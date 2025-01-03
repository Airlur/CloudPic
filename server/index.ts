import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authHandler from '../api/auth/index';
import storageHandler from '../api/services/storage/handlers/connections';
import filesHandler from '../api/services/storage/handlers/files';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingMessage, ServerResponse } from 'http';
import getFileUrlHandler from '../api/services/storage/handlers/file-url';

// 加载环境变量
config({ path: '.env.local' });

// 添加环境变量调试日志
// console.log('Environment variables:', {
//   JWT_SECRET: process.env.JWT_SECRET?.slice(0, 10) + '...',  // 只显示前10位
//   ACCESS_PASSWORD: process.env.ACCESS_PASSWORD,
//   NODE_ENV: process.env.NODE_ENV
// });

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 适配器: Express -> Vercel 请求/响应
const adaptHandler = (handler: (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse>) => {
  return async (req: Request, res: Response) => {
    // 创建基础 IncomingMessage
    const baseReq = Object.create(IncomingMessage.prototype);
    // 创建 VercelRequest
    const vercelReq = Object.assign(baseReq, {
      ...req,
      cookies: req.cookies || {},
      body: req.body,
      query: req.query,
      method: req.method,
      url: req.url
    }) as unknown as VercelRequest;

    // 创建基础 ServerResponse
    const baseRes = Object.create(ServerResponse.prototype);
    // 创建 VercelResponse
    const vercelRes = Object.assign(baseRes, {
      status: (code: number) => {
        res.status(code);
        return vercelRes;
      },
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string | string[]) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    }) as unknown as VercelResponse;

    await handler(vercelReq, vercelRes);
  };
};

// 路由处理
app.post('/api/auth', adaptHandler(authHandler));
app.get('/api/auth/verify', adaptHandler(authHandler));
app.post('/api/auth/logout', adaptHandler(authHandler));

// 存储服务路由
app.post('/api/storage/test', adaptHandler(storageHandler));
app.post('/api/storage', adaptHandler(storageHandler));
app.get('/api/storage', adaptHandler(storageHandler));
app.delete('/api/storage', adaptHandler(storageHandler));

// 文件操作路由
app.get('/api/storage/files', adaptHandler(filesHandler));

// 获取文件 URL 路由
app.get('/api/storage/file-url', adaptHandler(getFileUrlHandler));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 