# 云图项目设计文档

## 项目概述

云图-CloudPic是一个Web应用，旨在连接和管理多个云存储服务（如Backblaze B2、Cloudflare R2、S3兼容对象存储服务如MinIO），提供文件的上传、删除、预览等功能。用户通过单一访问密码进行身份验证。

## 项目架构设计

### 总体架构

项目基于 Vercel 平台构建，采用前后端分离的 Serverless 架构：

1. **前端技术栈**：
   - 构建：Vite ^6.0.5
   - 框架：React ^18.2.0 + TypeScript ~5.6.2
   - UI：Material-UI ^5.15.11
   - 状态：React Context
   - 路由：React Router ^6.20.0
   - 网络：Axios ^1.7.9
   - 国际化：i18next ^24.2.0

2. **组件设计**：
   - 容器组件：数据获取和逻辑处理
   - 展示组件：界面渲染和交互
   - 主题：支持亮暗模式切换，基于 MUI ThemeProvider

### 后端架构 (Serverless)

1. **API 设计**：
   - 基于 Vercel Serverless Functions
   - 通过 `/api/*` 路由自动映射
   - 支持单文件多路由模式

2. **数据存储**：
   - 配置存储：Vercel KV (Redis)
   - 结构化数据：Vercel Postgres
   - 本地开发：自动切换到 SQLite

3. **核心功能**：
   - 认证：基于 JWT 的无状态认证
   - 存储：多云存储服务统一管理
   - 文件：上传、预览、删除等操作
   - 图片：基于 sharp 的图片处理

4. **环境配置**：
   ```
   # 开发环境
   DATABASE_URL=file:./data/cloudpic.db
   
   # 生产环境
   POSTGRES_URL=xxx
   VERCEL_KV_URL=xxx
   ACCESS_PASSWORD=xxx
   ```

### 云存储服务扩展性设计

1. **统一接口设计**：
   ```typescript
   interface IStorageService {
     // 核心方法
     connect(): Promise<void>;                    // 连接并认证
     uploadFile(file: File): Promise<string>;     // 上传文件
     deleteFile(path: string): Promise<void>;     // 删除文件
     listFiles(prefix?: string): Promise<File[]>; // 列出文件
     getFileUrl(path: string): string;           // 获取访问URL
   }
   ```

2. **工厂模式实现**：
   - 通过工厂创建具体存储服务实例
   - 支持 B2、R2、S3 等多种存储服务
   - 统一的错误处理和重试机制
   - 可扩展的服务注册机制

3. **存储服务配置**：
   ```typescript
   interface StorageConfig {
     type: 'b2' | 'r2' | 's3';     // 服务类型
     endpoint?: string;             // 服务端点
     credentials: {                 // 认证信息
       accessKey: string;
       secretKey: string;
     };
     region?: string;              // 可选区域
     customDomain?: string;        // 自定义域名
   }
   ```

### 自定义域名功能设计

#### 功能概述

- 允许用户为已连接的存储桶配置自定义域名
- 支持通过自定义域名访问存储的文件
- 提供图床功能支持（Markdown格式链接）

#### 存储设计

```typescript
// 在storage_connections表中添加字段
interface StorageConnection {
  // ... 现有字段 ...
  customDomain?: {
    domain: string;        // 自定义域名
    enabled: boolean;      // 是否启用
    cdnProvider: string;   // CDN提供商
    https: boolean;        // 是否启用HTTPS
    antiLeech: boolean;    // 是否启用防盗链
  }
}
```

#### 实现方案

1. **Backblaze B2**
   - 使用Cloudflare Workers代理访问私密桶
   - 利用Cloudflare CDN全球加速
   - 通过带宽联盟优化流量成本

2. **Cloudflare R2**
   - 直接使用Cloudflare自定义域名
   - 原生CDN支持
   - 简化的域名配置流程

3. **其他S3兼容存储**
   - 使用Vercel Edge Network代理
   - 通过Vercel API处理认证和访问
   - 需考虑带宽使用成本

#### 配置流程

1. **存储桶连接后**：
   - 验证存储凭证，文件列表有1个设置按钮
   - 点击设置按钮显示域名配置选项
   - 根据存储类型提供配置指南

2. **域名配置**：
   - B2：配置Cloudflare Workers和路由
   - R2：设置Cloudflare域名和DNS
   - S3：配置Vercel代理和域名

3. **URL生成**：
   - 检查域名配置状态
   - 根据存储类型生成对应的访问URL
   - 支持生成Markdown格式链接

#### 安全考虑

- HTTPS强制启用
- 可选的防盗链功能
- 域名所有权验证
- 访问凭证安全存储

#### 具体配置步骤

1. **B2配置流程**：

   ```
   在CloudPic项目中需要：
   1. 用户添加B2存储桶配置
   2. 提供Cloudflare Workers代码和配置指南
   3. 生成域名验证记录
   
   在Cloudflare中需要：
   1. 用户添加域名到Cloudflare
   2. 创建并部署Workers
   3. 配置Workers环境变量（B2凭证等）
   4. 设置域名到Workers的路由
   
   在B2中需要：
   1. 保持私密桶设置
   2. 配置CORS和缓存策略
   ```

2. **R2配置流程**：

   ```
   在CloudPic项目中需要：
   1. 用户添加R2存储桶配置
   2. 通过R2 API配置自定义域名
   3. 生成DNS记录
   
   在Cloudflare中需要：
   1. 自动完成域名和CDN配置
   ```

3. **S3配置流程**：

   ```
   在CloudPic项目中需要：
   1. 用户添加S3存储桶配置
   2. 在Vercel添加域名
   3. 生成代理路由规则
   
   在用户DNS服务商需要：
   1. 配置CNAME记录指向Vercel
   ```

### 目录结构

```
/cloudpic
├── /api               # 无服务器函数 
│   ├── auth.ts          # 认证相关 (登录/登出/验证)
│   ├── providers.ts     # 云服务管理 (列表/连接/配置)
│   ├── files.ts         # 文件操作 (上传/删除/移动/预览)
│   ├── images.ts        # 图片处理 (压缩/缩略图/格式转换)
│   └── /services        # 服务层实现
│       ├── /storage       # 存储服务工厂
│       │   ├── types.ts     # 接口定义
│       │   ├── factory.ts   # 服务工厂实现
│       │   ├── b2.ts        # B2存储实现
│       │   ├── r2.ts        # R2存储实现
│       │   └── s3.ts        # S3兼容存储实现
│       └── /image         # 图片处理服务
│           ├── types.ts     # 接口定义
│           └── sharp.ts     # Sharp实现
├── /docs              # 项目文档
├── /public            # 静态文件
├── /src               # 源代码
│   ├── /components    # 组件
│   │   ├── /common    # 通用组件
│   │   ├── /feedback  # 反馈类组件
│   │   ├── /layout    # 布局组件
│   │   └── /data-display # 数据展示组件
│   ├── /pages         # 页面组件
│   │   ├── Login.tsx  # 登录页面
│   │   └── Home.tsx   # 主页面
│   ├── /utils         # 工具函数
│   │   ├── storage.ts # 本地存储工具
│   │   └── auth.ts    # 认证工具
│   ├── /themes        # 主题相关
│   │   ├── theme.ts   # 主题配置
│   │   └── ThemeContext.tsx # 主题上下文
│   ├── /i18n          # 多语言支持
│   │   ├── i18n.ts    # i18n配置
│   │   └── locales    # 语言文件
│   ├── /routes        # 路由配置
│   │   └── Router.tsx # 路由组件
│   ├── main.tsx       # 入口文件
│   ├── App.tsx        # 根组件
│   └── index.css      # 全局样式
├── .env.local         # 本地环境变量
├── vite.config.ts     # Vite配置
├── tsconfig.json      # TypeScript配置
├── package.json       # 项目依赖
└── README.md          # 项目说明
```

### 认证方案

1. **JWT认证流程**：
   - 用户输入访问密码
   - 验证通过后生成 JWT token 和 refresh token
   - token 存储在 secure storage
   - 请求时自动携带 token
   - token 过期自动刷新

2. **配置要求**：
   - 环境变量 `ACCESS_PASSWORD` 设置访问密码
   - JWT 密钥自动生成或通过环境变量配置
   - token 有效期默认 1 小时
   - refresh token 有效期 7 天

3. **请求认证**：
   ```typescript
   // API 请求拦截
   axios.interceptors.request.use(config => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   // 响应拦截（处理 token 过期）
   axios.interceptors.response.use(
     response => response,
     async error => {
       if (error.response?.status === 401) {
         // 尝试刷新 token
         return refreshTokenAndRetry(error.config);
       }
       return Promise.reject(error);
     }
   );
   ```

### 交互流程

1. **用户登录**：
   - 用户访问登录页面，输入访问密码
   - 密码加密后发送到后端验证
   - 验证通过后：
     - 后端生成 JWT token 和 refresh token
     - 前端存储认证信息到 secure storage
     - 配置 API 请求拦截器
   - 跳转至主页，开始定期检查 token 有效性

2. **添加存储连接**：
   - 用户点击"添加连接"按钮，弹出连接弹窗。
   - 用户选择云存储服务商并填写认证信息。
   - 前端将信息发送至后端，后端验证并保存连接信息。

3. **文件操作**：
   - 用户在文件列表中选择文件进行操作（上传、删除、预览）。
   - 前端发送相应请求至后端，后端调用云存储服务的API执行操作。
   - 操作完成后，返回结果给前端并更新界面。

## 用户界面布局和交互逻辑

### 1. 登录页

- **功能**：
  - 用户输入访问密码进行身份验证
  - 密码验证通过后生成访问令牌
  - 存储认证信息到secure storage
  - 配置API请求认证
- **布局**：
  - 输入框：用于输入访问密码
  - 登录按钮：提交密码进行验证
  - 提示信息：显示登录成功或失败的消息

### 2. 主页

- **功能**：展示已连接的存储服务和文件列表。
- **布局**：
  - **顶部**：
    - 项目Logo和名称
    - 添加连接按钮
    - 登出按钮
    - 主题切换按钮
    - 语言切换按钮
  - **左侧导航栏**：
    - 显示已连接的存储服务（如B2、R2），展示已连接的云存储服务商的图标和名称。
    - 点击服务后，右侧显示对应的文件列表。
  - **右侧文件区域**：
    - 显示文件列表，有Grid和List两种样式，包含文件的缩略图、名称、大小、修改时间等信息。
    - 文件操作按钮（删除、移动等）位于文件列表上方。

### 3. 连接弹窗

- **功能**：用户可以添加新的存储连接。
- **布局**：
  - 服务商列表：展示支持的云存储服务商的图标和名称。
  - 认证表单：根据选择的服务商展示相应的认证表单（如存储桶名称、API密钥ID、API密钥等信息，具体信息需要根据服务商的API文档进行配置）。
  - 提交按钮：提交认证信息进行连接。

### 4. 文件列表组件

- **功能**：展示文件和文件夹，支持预览和操作。
- **布局**：
  - 上方导航：显示当前路径（如首页/文件夹名），包含文件和文件夹的操作按钮和自定义域名设置的按钮。
  - 文件操作按钮：包括新建文件夹、上传文件、下载、删除、移动等操作。
  - 自定义域名设置按钮：显示域名配置选项，根据存储类型提供配置指南文档链接，后面在docs文档下存放这些教程md文档，可通过路由配置调整显示文档。
  - 文件列表：
    - grid和list两种样式切换。
    - 每个文件或文件夹旁边有选择框，顶部有全选的选择框，以便进行批量操作。
    - 文件预览组件：点击文件后，展示美观的预览界面。需要注意对文件夹的操作不是预览，而是进入到文件夹内部，查询新的文件列表。

### 5. 自定义域名配置弹窗

- **功能**：配置存储桶的自定义域名访问。
- **布局**：
  - **头部**：
    - 标题：显示当前存储桶名称
    - 关闭按钮：关闭配置弹窗
  - **配置区域**：
    - 域名输入框：输入自定义域名
    - 启用开关：控制是否启用自定义域名
    - CDN选项：选择CDN提供商（Cloudflare/Vercel）
    - HTTPS开关：控制是否强制HTTPS
    - 防盗链开关：控制是否启用防盗链
  - **指南区域**：
    - 根据存储类型（B2/R2/S3）显示对应的配置指南
    - 指南内容从docs目录下的md文档中加载
    - 包含分步骤的配置说明和截图
  - **操作按钮**：
    - 保存按钮：保存域名配置
    - 验证按钮：验证域名可用性
    - 取消按钮：放弃更改并关闭

### 6. 返回信息提示

- **功能**：根据请求结果提供用户反馈。
- **布局**：
  - 成功或失败的消息提示框，位于页面顶部。

### 7. 404页面

- **功能**：处理未找到页面的情况。
- **布局**：
  - 提示用户页面未找到信息，无任何操作后10秒自动返回主页或点击手动返回主页按钮。

## Vercel一键部署

1. **创建Vercel项目**：
   - 在Vercel官网注册账号并创建新项目。
   - 将已fork的GitHub代码仓库连接到Vercel。

2. **配置环境变量**：
   - 在Vercel项目设置中添加环境变量：
     - `ACCESS_PASSWORD`：访问密码

3. **简单部署**：
   - 确保项目的 `package.json` 中包含启动脚本。
   - 提交代码后，Vercel会自动构建并部署项目。

## 本地开发说明

1. **云存储服务开发**：
   - 直接使用B2/R2的API进行开发和测试
   - 创建专门用于测试的存储桶
   - 确保测试桶的API密钥权限配置正确

2. **数据库配置**：
   - 安装依赖：`npm install sqlite3 sqlite`
   - 数据库初始化在首次运行时自动完成
   - 数据库文件默认存储在 `./data/cloudpic.db`

3. **环境切换**：
   - 通过 `process.env.VERCEL` 判断运行环境
   - 本地开发自动使用 SQLite
   - 部署到 Vercel 时自动切换到 Vercel 数据库服务
   - 数据访问层封装确保切换对业务代码透明

## 其他注意事项

1. **代码注释**：确保代码中有充分的注释，便于理解。
2. **API文档**：使用真实有效的API文档，确保调用的库和方法正确。
3. **测试**：在本地开发过程中，无法先将项目部署到vercle中，所以考虑到本地测试的情况，先模拟，确保功能正常。