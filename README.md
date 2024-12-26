# CloudPic 云图

<div align="center">

[English](./docs/translations/README.en.md) | 简体中文 | [日本語](./docs/translations/README.ja.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAirlur%2FCloudPic)

</div>

一个用于连接和管理多个云存储服务的Web应用，支持Backblaze B2、Cloudflare R2等存储服务。

## 特性

- 支持多个云存储服务（B2、R2、S3兼容服务）
- 文件上传、删除、预览
- 简单的访问密码认证
- 暗黑/明亮主题切换
- 多语言支持

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 本地开发
```bash
npm run dev
```

3. 构建项目
```bash
npm run build
```

## 开发指南

- 详细的设计文档请查看 [设计文档](docs/design.md)
- 本地开发请参考设计文档中的"本地开发说明"章节

## 部署指南

### Vercel 一键部署

1. 点击上方的 "Deploy with Vercel" 按钮
2. 如果没有 Vercel 账号，需要先注册
3. 授权 GitHub 并选择仓库
4. 配置以下环境变量：
   - `ACCESS_PASSWORD`: 访问密码
5. 点击 "Deploy" 开始部署

### 手动部署

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Express
- Vercel 